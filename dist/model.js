"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var EventEmitter = require("events").EventEmitter;

var Schema = _interopRequire(require("./schemas/index"));

var Document = _interopRequire(require("./document"));

var _async = require("async");

var waterfall = _async.waterfall;
var each = _async.each;
var serial = _async.serial;

var convertType = _interopRequire(require("./types/convert"));

var RidType = _interopRequire(require("./types/rid"));

var extend = _interopRequire(require("node.extend"));

var debug = _interopRequire(require("debug"));

var _ = _interopRequire(require("lodash"));

var Query = _interopRequire(require("./query"));

var log = debug("orientose:model");

var Model = (function (_EventEmitter) {
	function Model(name, schema, connection, options, callback) {
		var _this = this;

		_classCallCheck(this, Model);

		if (!name) {
			throw new Error("Model name is not defined");
		}

		if (!schema instanceof Schema) {
			throw new Error("This is not a schema");
		}

		if (!connection) {
			throw new Error("Connection is undefined");
		}

		if (typeof options === "function") {
			callback = options;
			options = {};
		}

		callback = callback || function () {};

		this._name = name;
		this._schema = schema;
		this._connection = connection;
		this._options = options || {};

		this._documentClass = Document.createClass(this);

		if (options.ensure !== false) {
			this._ensureClass(function (err, model) {
				if (err) {
					log("Model " + _this.name + ": " + err.message);
				}

				callback(err, model);
			});
		}
	}

	_inherits(Model, _EventEmitter);

	_createClass(Model, {
		DocumentClass: {
			get: function () {
				return this._documentClass;
			}
		},
		name: {
			get: function () {
				return this._name;
			}
		},
		schema: {
			get: function () {
				return this._schema;
			}
		},
		connection: {
			get: function () {
				return this._connection;
			}
		},
		db: {
			get: function () {
				return this.connection.db;
			}
		},
		isEdge: {
			get: function () {
				return this.schema.isEdge;
			}
		},
		options: {
			get: function () {
				return this._options;
			}
		},
		model: {
			value: function model(name) {
				return this.connection.model(name);
			}
		},
		_ensureIndex: {
			value: function _ensureIndex(OClass, callback) {
				var db = this.db;
				var className = this.name;
				var schema = this.schema;

				waterfall([function (callback) {
					db.index.list(true).then(function (indexes) {
						//filter indexes for current class
						indexes = indexes.filter(function (index) {
							var def = index.definition;
							if (!def || def.className !== className) {
								return false;
							}

							return true;
						});

						callback(null, indexes);
					}, callback);
				},
				//remove unused indexes
				function (indexes, callback) {
					each(indexes, function (index, callback) {
						var definition = index.definition;
						var type = index.type;
						var name = index.name;

						if (schema.hasIndex(name)) {
							return callback(null);
						}

						db.index.drop(name).then(function (droped) {
							callback(null);
						}, callback);
					}, function (err) {
						if (err) {
							return callback(err);
						}

						callback(null, indexes);
					});
				},
				//add non exists indexes
				function (indexes, callback) {
					var configs = [];

					each(schema.indexNames, function (indexName, callback) {
						var index = schema.getIndex(indexName);

						//add class name to indexName
						indexName = className + "." + indexName;

						var oIndex = indexes.find(function (index) {
							return index.name === indexName;
						});

						if (oIndex) {
							return callback(null);
						}

						var config = {
							"class": className,
							name: indexName,
							properties: Object.keys(index.properties),
							type: index.type
						};

						configs.push(config);

						db.index.create(config).then(function () {
							callback(null);
						}, callback);
					}, function (err) {
						if (err) {
							return callback(err);
						}

						callback(null, indexes);
					});
				}], callback);
			}
		},
		_ensureClass: {
			value: function _ensureClass(callback) {
				var _this = this;

				var model = this;
				var db = this.db;
				var schema = this.schema;
				var className = this.name;
				callback = callback || function () {};

				waterfall([
				//prepare base class
				function (callback) {
					db["class"].get(className).then(function (OClass) {
						callback(null, OClass);
					}, function (err) {
						db["class"].create(className, schema.extendClassName, model.options.cluster, model.options.abstract).then(function (OClass) {
							callback(null, OClass);
						}, callback);
					});
				},
				//retrive a current properties
				function (OClass, callback) {
					OClass.property.list().then(function (properties) {
						callback(null, OClass, properties);
					}, callback);
				},
				//drop unused properties
				function (OClass, oProperties, callback) {
					each(oProperties, function (prop, callback) {
						if (schema.has(prop.name)) {
							return callback(null);
						}

						OClass.property.drop(prop.name).then(function () {
							callback(null);
						}, callback);
					}, function (err) {
						if (err) {
							return callback(err);
						}

						callback(null, OClass, oProperties);
					});
				},
				//add new properties
				function (OClass, oProperties, callback) {
					var properties = schema.propertyNames();

					each(properties, function (propName, callback) {
						var prop = oProperties.find(function (p) {
							return p.name === propName;
						});

						if (prop) {
							return callback(null);
						}

						var schemaProp = schema.getPath(propName);
						var schemaType = schema.getSchemaType(propName);
						var type = schemaType.getDbType(schemaProp.options);

						if (schemaProp.options.metadata || schemaProp.options.ensure === false) {
							return callback(null);
						}

						waterfall([
						//create LinkedClass for embedded documents
						function (callback) {
							if (type === "EMBEDDED" && schemaType.isObject) {
								var modelName = className + "A" + _.capitalize(propName);

								return new Model(modelName, schemaProp.type, model.connection, {
									abstract: true
								}, callback);
							} else if (type === "EMBEDDEDLIST" && schemaType.isArray && schemaProp.item) {
								var item = schemaProp.item;
								if (item.schemaType.isObject) {
									var modelName = className + "A" + _.capitalize(propName);

									return new Model(modelName, item.type, model.connection, {
										abstract: true
									}, callback);
								}
							}

							callback(null, null);
						}, function (model, callback) {
							var options = schemaProp.options;

							var config = {
								name: propName,
								type: type,
								mandatory: options.mandatory || options.required || false,
								min: typeof options.min !== "undefined" ? options.min : null,
								max: typeof options.max !== "undefined" ? options.max : null,
								collate: options.collate || "default",
								notNull: options.notNull || false,
								readonly: options.readonly || false
							};

							var additionalConfig = schemaType.getPropertyConfig(schemaProp);
							extend(config, additionalConfig);

							if (model) {
								if (config.linkedType) {
									delete config.linkedType;
								}

								config.linkedClass = model.name;
							}

							OClass.property.create(config).then(function (oProperty) {
								oProperties.push(oProperty);
								callback(null);
							}, callback);
						}], callback);
					}, function (err) {
						if (err) {
							return callback(err);
						}

						callback(null, OClass, oProperties);
					});
				}, function (OClass, oProperties, callback) {
					_this._ensureIndex(OClass, callback);
				}], function (err) {
					if (err) {
						return callback(err);
					}

					callback(null, _this);
				});
			}
		},
		_createDocument: {
			value: function _createDocument(properties) {
				var model = this.DocumentClass;
				var className = properties["@class"];
				if (className) {
					model = this.model(className);
				}

				if (!model) {
					throw new Error("There is no model for class: " + className);
				}

				return new model({}).setupData(properties);
			}
		},
		create: {
			value: function create(properties, callback) {
				var schema = this.schema;

				properties = properties || {};

				if (schema.isEdge) {
					if (!properties["in"] || !properties.out) {
						throw new Error("In out is not defined");
					}

					var from = properties["in"];
					var to = properties.out;

					delete properties["in"];
					delete properties.out;

					return this.createEdge(from, to, properties, callback);
				}

				return new Query(this, {}).create(properties, callback);
			}
		},
		createEdge: {
			value: function createEdge(from, to, properties, callback) {
				var _this = this;

				this.db.create("EDGE", this.name).from(from).to(to).set(properties).transform(function (record) {
					return _this._createDocument(record);
				}).one().then(function (item) {
					callback(null, item);
				}, callback);
			}
		},
		remove: {
			value: function remove(where, callback) {
				return new Query(this, options).remove(where, callback);
				/*
    		this.db
    			.delete()
    			.from(this.name)
    			.where(where)
    			.scalar()
    			.then(function(total) {
    				callback(null, total);
    			}, callback);*/
			}
		},
		removeByRid: {
			value: function removeByRid(rid, callback) {
				this.db.record["delete"](rid).then(function (response) {
					if (!response || !response["@rid"]) {
						return callback(null, 0);
					}

					var currentRid = RidType.objectToString(response["@rid"]);
					if (currentRid === rid) {
						return callback(null, 1);
					}

					callback(null, 0);
				}, callback);
			}
		},
		removeEdgeByRid: {
			value: function removeEdgeByRid(rid, callback) {
				this.db["delete"]("EDGE", rid).scalar().then(function (affectedRows) {
					callback(null, affectedRows);
				}, callback);
			}
		},
		removeVertexByRid: {
			value: function removeVertexByRid(rid, callback) {
				this.db["delete"]("VERTEX", rid).scalar().then(function (affectedRows) {
					callback(null, affectedRows);
				}, callback);
			}
		},
		update: {
			value: function update(where, properties, callback) {
				this.db.update(this.name).set(properties).where(where).scalar().then(function (total) {
					callback(null, total);
				}, callback);
			}
		},
		updateByRid: {
			value: function updateByRid(rid, properties, callback) {
				this.db.update(rid).set(properties).scalar().then(function (total) {
					callback(null, total);
				}, callback);
			}
		},
		find: {
			value: function find(where, options, callback) {
				if (typeof options === "function") {
					callback = options;
					options = {};
				}

				options = options || {};

				return new Query(this, options).find(where, callback);
			}
		},
		findOne: {
			value: function findOne(where, options, callback) {
				if (typeof options === "function") {
					callback = options;
					options = {};
				}

				options = options || {};

				return new Query(this, options).findOne(where, callback);
			}
		},
		findByRid: {
			value: function findByRid(rid, callback) {
				var _this = this;

				this.db.record.get(rid).then(function (record) {
					callback(null, _this._createDocument(record));
				}, callback);
			}
		}
	});

	return Model;
})(EventEmitter);

module.exports = Model;