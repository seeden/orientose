import { EventEmitter } from 'events';
import Schema from './schemas/index';
import Document from './document';
import { waterfall, each, serial } from 'async';
import convertType from './types/convert';
import RidType from './types/rid';
import extend from 'node.extend';
import debug from 'debug';
import _ from 'lodash';

const log = debug('orientose:model');

export default class Model extends EventEmitter {
	constructor (name, schema, connection, options, callback) {
		if(!name) {
			throw new Error('Model name is not defined');
		}

		if(!schema instanceof Schema) {
			throw new Error('This is not a schema');
		}

		if(!connection) {
			throw new Error('Connection is undefined');
		}

		if(typeof options === 'function') {
			callback = options;
			options = {};
		}

		callback = callback || function() {};

		this._name = name;
		this._schema = schema;
		this._connection = connection;
		this._options = options || {};

		this._documentClass = Document.createClass(this);

		if(options.ensure !== false) {
			this._ensureClass((err, model) => {
				if(err) {
					log('Model ' + this.name + ': ' + err.message);
				}

				callback(err, model);
			});	
		}
	}

	get DocumentClass() {
		return this._documentClass;
	}

	get name() {
		return this._name;
	}

	get schema() {
		return this._schema;
	}

	get connection() {
		return this._connection;
	}

	get db() {
		return this.connection.db;
	}

	get isEdge() {
		return this.schema.isEdge;
	}

	get options() {
		return this._options;
	}

	model(name) {
		return this.connection.model(name);
	}

	_ensureIndex(OClass, callback) {
		var db = this.db;
		var className = this.name;
		var schema = this.schema;

		waterfall([
			function(callback) {
				db.index.list(true).then(function(indexes) {
					//filter indexes for current class
					indexes = indexes.filter(function(index) {
						var def = index.definition;
						if(!def || def.className !== className) {
							return false;
						}

						return true;
					});

					callback(null, indexes);
				}, callback);
			}, 
			//remove unused indexes
			function(indexes, callback) {
				each(indexes, function(index, callback) {
					var { definition, type, name } = index;

					if(schema.hasIndex(name)) {
						return callback(null);
					}

					db.index.drop(name).then(function(droped) {
						callback(null);
					}, callback);
				}, function(err) {
					if(err) {
						return callback(err);
					}

					callback(null, indexes);
				});
			},
			//add non exists indexes
			function(indexes, callback) {
				var configs = [];

				each(schema.indexNames, function(indexName, callback) {
					var index = schema.getIndex(indexName);

					//add class name to indexName
					indexName = className + '.' + indexName;

					var oIndex = indexes.find(function(index) {
						return index.name === indexName;
					});

					if(oIndex) {
						return callback(null);
					}

					var config = {
						'class'    : className, 
						name       : indexName,
						properties : Object.keys(index.properties),
						type       : index.type
					};

					configs.push(config);

					db.index.create(config).then(function() {
						callback(null);
					}, callback);
				}, function(err) {
					if(err) {
						return callback(err);
					}

					callback(null, indexes);
				});
			},			
		], callback);
	}

	_ensureClass(callback) {
		var model = this;
		var db = this.db;
		var schema = this.schema;
		var className = this.name;
		callback = callback || function() {};

		waterfall([
			//prepare base class
			function(callback) {
				db.class.get(className).then(function(OClass) {
					callback(null, OClass);
				}, function(err) {
					db.class.create(className, schema.extendClassName, model.options.cluster, model.options.abstract).then(function(OClass) {
						callback(null, OClass);
					}, callback);
				});
			},
			//retrive a current properties
			function(OClass, callback) {
				OClass.property.list().then(function(properties) {
					callback(null, OClass, properties);
				}, callback);
			},
			//drop unused properties
			function(OClass, oProperties, callback) {
				each(oProperties, function(prop, callback) {
					if(schema.has(prop.name)) {
						return callback(null);
					}

					OClass.property.drop(prop.name).then(function() {
						callback(null);
					}, callback);
				}, function(err) {
					if(err) {
						return callback(err);
					}

					callback(null, OClass, oProperties);
				});
			},
			//add new properties
			function(OClass, oProperties, callback) {
				var properties = schema.propertyNames();

				each(properties, function(propName, callback) {
					var prop = oProperties.find(function(p) {
						return p.name === propName;
					});

					if(prop)  {
						return callback(null);
					}

					var schemaProp = schema.getPath(propName);
					var schemaType = schema.getSchemaType(propName);
					var type = schemaType.getDbType(schemaProp.options);

					if(schemaProp.options.metadata || schemaProp.options.ensure === false) {
						return callback(null);
					}

					waterfall([
						//create LinkedClass for embedded documents
						function(callback) { 
							if(type === 'EMBEDDED' && schemaType.isObject) {
								var modelName = className + 'A' + _.capitalize(propName);

								return new Model(modelName, schemaProp.type, model.connection, {
									abstract: true
								}, callback);
							} else if(type === 'EMBEDDEDLIST' && schemaType.isArray && schemaProp.item) {
								var item = schemaProp.item;
								if(item.schemaType.isObject) {
									var modelName = className + 'A' + _.capitalize(propName);

									return new Model(modelName, item.type, model.connection, {
										abstract: true
									}, callback);
								}
							}

							callback(null, null);
						}, function(model, callback) {
							var options = schemaProp.options;

							var config = {
								name: propName,
								type: type,
								mandatory: options.mandatory || options.required || false,
								min: typeof options.min !== 'undefined' ? options.min : null,
								max: typeof options.max !== 'undefined' ? options.max : null,
								collate: options.collate || 'default',
								notNull: options.notNull || false,
								readonly : options.readonly  || false
							};

							var additionalConfig = schemaType.getPropertyConfig(schemaProp);
							extend(config, additionalConfig);

							if(model) {
								if(config.linkedType) {
									delete config.linkedType;
								}

								config.linkedClass = model.name;
							}

							OClass.property.create(config).then(function(oProperty) {
								oProperties.push(oProperty);
								callback(null);
							}, callback);
						}
					], callback);
				}, function(err) {
					if(err) {
						return callback(err);
					}

					callback(null, OClass, oProperties);
				});
			},
			(OClass, oProperties, callback) => {
				this._ensureIndex(OClass, callback);
			}
		], (err) => {
			if(err) {
				return callback(err);
			}

			callback(null, this);
		});
	}

	_createDocument (properties) {
		var model = this.DocumentClass;
		var className = properties['@class'];
		if(className) {
			model = this.model(className);
		}

		if(!model) {
			throw new Error('There is no model for class: ' + className);
		}

		return new model({}).setupData(properties);
	}

	create (properties, callback) {
		var schema = this.schema;

		properties = properties || {};

		if(schema.isEdge) {
			if(!properties['in'] || !properties['out']) {
				throw new Error('In out is not defined');
			}

			var from = properties['in'];
			var to = properties['out'];

			delete properties['in'];
			delete properties['out'];

			return this.createEdge(from, to, properties, callback);
		}

		this.db
			.insert()
			.into(this.name)
			.set(properties)
			.transform(record => {
				return this._createDocument(record);
			})
			.one()
			.then(function (item) {
				callback(null, item);
			}, callback);
	}

	createEdge(from, to, properties, callback) {
		this.db
			.create('EDGE', this.name)
			.from(from)
			.to(to)
			.set(properties)
			.transform(record => {
				return this._createDocument(record);
			})
			.one()
			.then(function (item) {
				callback(null, item);
			}, callback);		
	}

	remove (where, callback) {
		this.db
			.delete()
			.from(this.name)
			.where(where)
			.scalar()
			.then(function(total) {
				callback(null, total);
			}, callback);
	}

	removeByRid(rid, callback) {
		this.db
			.record
			.delete(rid)
			.then(function(response) {
				if(!response || !response['@rid']) {
					return callback(null, 0);
				}

				var currentRid = RidType.objectToString(response['@rid']);
				if(currentRid === rid) {
					return callback(null, 1);
				}

				callback(null, 0);
			}, callback);		
	}

	removeEdgeByRid(rid, callback) {
		this.db
			.delete('EDGE', rid)
			.scalar()
			.then(function (affectedRows) {
				callback(null, affectedRows)
			}, callback);
	}

	removeVertexByRid(rid, callback) {
		this.db
			.delete('VERTEX', rid)
			.scalar()
			.then(function (affectedRows) {
				callback(null, affectedRows)
			}, callback);
	}	

	update (where, properties, callback) {
		this.db
			.update(this.name)
			.set(properties)
			.where(where)
			.scalar()
			.then(function(total) {
				callback(null, total);
			}, callback);
	}

	updateByRid (rid, properties, callback) {
		this.db
			.update(rid)
			.set(properties)
			.scalar()
			.then(function(total) {
				callback(null, total);
			}, callback);
	}

	find (where, options, callback) {
		if(typeof options === 'function') {
			callback = options;
			options = {};
		}

		options = options || {};

		this.db
			.select()
			.from(this.name)
			.where(where)
			.transform(record => {
				return this._createDocument(record);
			})
			.all()
			.then(function(items) {
				callback(null, items);
			}, function(err) {
				callback(err);
			});
	}

	findOne (where, options, callback) {
		if(typeof options === 'function') {
			callback = options;
			options = {};
		}

		options = options || {};

		this.db
			.select()
			.from(this.name)
			.where(where)
			.transform(record => {
				return this._createDocument(record);
			})
			.limit(1)
			.one()
			.then(function(item) {
				callback(null, item);
			}, function(err) {
				callback(err);
			});
	}

	findByRid (rid, callback) {
		this.db
			.record
			.get(rid)
			.then(record => {
				callback(null, this._createDocument(record));
			}, callback);
	}	
}