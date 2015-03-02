import { EventEmitter } from 'events';
import Schema from './schema';
import Document from './document';
import {waterfall, each, serial} from 'async';
import convertType from './types/convert';

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

					OClass.property.create({
						name: propName,
						type: convertType(options.type).dbType,
						mandatory: options.mandatory || options.required || false,
						min: options.min || null,
						max: options.max || null,
						collate: options.collate || 'default',
						notNull: options.notNull || false,
						readonly : options.readonly  || false
					}).then(function(oProperty) {
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
		return fields;
	}

	create (fields, callback) {
		this
			.getDB()
			.into(this.name)
			.set(fields)
			.one()
			.then(function(item) {
				callback(null, this._createDocument(item));
			}, function(err) {
				callback(err);
			});
	}

	remove (where, callback) {
		this
			.getDB()
			.delete()
			.from(this.getName())
			.where(where)
			.scalar()
			.then(function(total) {
				callback(null, total);
			}, function(err) {
				callback(err);
			});
	}

	update (where, fields, callback) {
		this
			.getDB()
			.update(this.getName())
			.set(fields)
			.where(where)
			.scalar()
			.then(function(total) {
				callback(null, total);
			}, function(err) {
				callback(err);
			});
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
}