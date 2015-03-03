import { EventEmitter } from 'events';
import Schema from './schemas/index';
import Document from './document';
import {waterfall, each, serial} from 'async';
import convertType from './types/convert';
import RidType from './types/rid';
import extend from 'node.extend';

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

		this._name = name;
		this._schema = schema;
		this._connection = connection;
		this._options = options || {};

		this._documentClass = Document.createClass(this);

		this._OClass = null; //oriento class
		this._oProperties = [];

		this._ensureClass(callback);
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

	/*
		Returns another Model instance.
	*/
	model(name) {
		return this.connection.model(name);
	}

	ensureIndex() {

	}

	_ensureClass(callback) {
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
					db.class.create(className).then(function(OClass) {
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
					var prop = oProperties.find(p => p.name === propName);
					if(prop)  {
						return callback(null);
					}

					var options = schema.get(propName);
					var schemaType = schema.getSchemaType(propName);

					if(options.exclude) {
						return callback(null);
					}

					var config = {
						name: propName,
						type: schemaType.dbType,
						mandatory: options.mandatory || options.required || false,
						min: typeof options.min !== 'undefined' ? options.min : null,
						max: typeof options.max !== 'undefined' ? options.max : null,
						collate: options.collate || 'default',
						notNull: options.notNull || false,
						readonly : options.readonly  || false
					};

					var additionalConfig = schemaType.getPropertyConfig(options);
					extend(config, additionalConfig);

					OClass.property.create(config).then(function(oProperty) {
						oProperties.push(oProperty);
						callback(null);
					}, callback);
				}, function(err) {
					if(err) {
						return callback(err);
					}

					callback(null, OClass, oProperties);
				});
			}
		], (err, OClass, oProperties) => {
			if(err) {
				return callback(err);
			}

			this._OClass = OClass;
			this._oProperties = oProperties;

			callback(null, this);
		});
	}

	_createDocument (fields) {
		return new this.DocumentClass({}).setupData(fields);
	}

	create (fields, callback) {
		this.db
			.insert()
			.into(this.name)
			.set(fields)
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

	update (where, fields, callback) {
		this.db
			.update(this.name)
			.set(fields)
			.where(where)
			.scalar()
			.then(function(total) {
				callback(null, total);
			}, callback);
	}

	updateByRid (rid, fields, callback) {
		this.db
			.update(rid)
			.set(fields)
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

		this
			.getDB()
			.select()
			.from(this.getName())
			.where(where)
			.transform(function (record) {
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

		this
			.getDB()
			.select()
			.from(this.getName())
			.where(where)
			.transform(function (record) {
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