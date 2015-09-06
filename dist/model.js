'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _schemasIndex = require('./schemas/index');

var _schemasIndex2 = _interopRequireDefault(_schemasIndex);

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _async = require('async');

var _typesConvert = require('./types/convert');

var _typesConvert2 = _interopRequireDefault(_typesConvert);

var _typesRid = require('./types/rid');

var _typesRid2 = _interopRequireDefault(_typesRid);

var _nodeExtend = require('node.extend');

var _nodeExtend2 = _interopRequireDefault(_nodeExtend);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _query = require('./query');

var _query2 = _interopRequireDefault(_query);

var log = (0, _debug2['default'])('orientose:model');

var Model = (function (_EventEmitter) {
	_inherits(Model, _EventEmitter);

	function Model(name, schema, connection, options, callback) {
		var _this = this;

		_classCallCheck(this, Model);

		_get(Object.getPrototypeOf(Model.prototype), 'constructor', this).call(this);
		if (!name) {
			throw new Error('Model name is not defined');
		}

		if (!schema instanceof _schemasIndex2['default']) {
			throw new Error('This is not a schema');
		}

		if (!connection) {
			throw new Error('Connection is undefined');
		}

		if (typeof options === 'function') {
			callback = options;
			options = {};
		}

		options.dropUnusedProperties = options.dropUnusedProperties || false;
		options.dropUnusedIndexes = options.dropUnusedIndexes || false;

		callback = callback || function () {};

		this._name = name;
		this._schema = schema;
		this._connection = connection;
		this._options = options || {};

		this._documentClass = _document2['default'].createClass(this);

		if (options.ensure !== false) {
			this._ensureClass(function (err, model) {
				if (err) {
					log('Model ' + _this.name + ': ' + err.message);
				}

				callback(err, model);
			});
		} else {
			// i believe it should still call
			callback(null, this);
		}
	}

	_createClass(Model, [{
		key: 'model',
		value: function model(name) {
			return this.connection.model(name);
		}
	}, {
		key: '_ensureIndex',
		value: function _ensureIndex(OClass, callback) {
			var db = this.db;
			var className = this.name;
			var schema = this.schema;
			var model = this;

			(0, _async.waterfall)([function (callback) {
				//todo speeed up for each class is same
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
				if (!model.options.dropUnusedIndexes) {
					return callback(null, indexes);
				}

				(0, _async.each)(indexes, function (index, callback) {
					var definition = index.definition;
					var type = index.type;
					var name = index.name;

					var schemaIndexName = name;
					var indexStartName = className + '.';
					if (schemaIndexName.indexOf(indexStartName) === 0) {
						schemaIndexName = schemaIndexName.substr(indexStartName.length);
					}

					if (schema.hasIndex(schemaIndexName)) {
						return callback(null);
					}

					log('Deleting unused index: ' + name);

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

				(0, _async.each)(schema.indexNames, function (indexName, callback) {
					var index = schema.getIndex(indexName);

					//add class name to indexName
					indexName = className + '.' + indexName;

					var oIndex = indexes.find(function (index) {
						return index.name === indexName;
					});

					if (oIndex) {
						return callback(null);
					}

					log('Creating index: ' + indexName);

					var config = {
						'class': className,
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
	}, {
		key: '_ensureClass',
		value: function _ensureClass(callback) {
			var _this2 = this;

			var model = this;
			var db = this.db;
			var schema = this.schema;
			var className = schema._options.className || this.name;
			callback = callback || function () {};

			(0, _async.waterfall)([
			//prepare base class
			function (callback) {
				db['class'].get(className).then(function (OClass) {
					callback(null, OClass);
				}, function (err) {
					db['class'].create(className, schema.extendClassName, model.options.cluster, model.options.abstract).then(function (OClass) {
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
				if (!model.options.dropUnusedProperties) {
					return callback(null, OClass, oProperties);
				}

				(0, _async.each)(oProperties, function (prop, callback) {
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

				(0, _async.each)(properties, function (propName, callback) {
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

					(0, _async.waterfall)([
					//create LinkedClass for embedded documents
					function (callback) {
						if (type === 'EMBEDDED' && schemaType.isObject) {
							var modelName = className + 'A' + _lodash2['default'].capitalize(propName);

							return new Model(modelName, schemaProp.type, model.connection, {
								abstract: true
							}, callback);
						} else if (type === 'EMBEDDEDLIST' && schemaType.isArray && schemaProp.item) {
							var item = schemaProp.item;
							if (item.schemaType.isObject) {
								var modelName = className + 'A' + _lodash2['default'].capitalize(propName);

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
							min: typeof options.min !== 'undefined' ? options.min : null,
							max: typeof options.max !== 'undefined' ? options.max : null,
							collate: options.collate || 'default',
							notNull: options.notNull || false,
							readonly: options.readonly || false
						};

						var additionalConfig = schemaType.getPropertyConfig(schemaProp);
						(0, _nodeExtend2['default'])(config, additionalConfig);

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
				_this2._ensureIndex(OClass, callback);
			}], function (err) {
				if (err) {
					return callback(err);
				}

				callback(null, _this2);
			});
		}
	}, {
		key: '_createDocument',
		value: function _createDocument(properties) {
			var model = this.DocumentClass;
			var className = properties['@class'];
			if (className) {
				model = this.model(className);
			}
			if (!model) {
				throw new Error('There is no model for class: ' + className);
			}

			return new model({}).setupData(properties);
		}
	}, {
		key: 'transaction',
		value: function transaction(_transaction) {
			this._transaction = _transaction;
			return this;
		}
	}, {
		key: 'createQuery',
		value: function createQuery(options) {
			return new _query2['default'](this, options);
		}
	}, {
		key: 'let',
		value: function _let(name, statement) {
			return this.createQuery({})['let'](name, statement);
		}
	}, {
		key: 'where',
		value: function where(conditions) {
			console.log("+++++++++++++++++++++");
			return this.createQuery({}).where(conditions);
		}
	}, {
		key: 'create',
		value: function create(doc, callback) {
			return this.createQuery({}).create(doc, callback);
		}
	}, {
		key: 'update',
		value: function update(conditions, doc, options, callback) {
			return this.createQuery({}).update(conditions, doc, options, callback);
		}
	}, {
		key: 'find',
		value: function find(conditions, callback) {
			return this.createQuery({}).find(conditions, callback);
		}
	}, {
		key: 'findOne',
		value: function findOne(conditions, callback) {
			return this.createQuery({}).findOne(conditions, callback);
		}
	}, {
		key: 'remove',
		value: function remove(conditions, callback) {
			return this.createQuery({}).remove(conditions, callback);
		}
	}, {
		key: 'count',
		value: function count(key) {
			return this.createQuery({}).count(key);
		}
	}, {
		key: 'DocumentClass',
		get: function get() {
			return this._documentClass;
		}
	}, {
		key: 'name',
		get: function get() {
			return this._name;
		}
	}, {
		key: 'schema',
		get: function get() {
			return this._schema;
		}
	}, {
		key: 'connection',
		get: function get() {
			return this._connection;
		}
	}, {
		key: 'db',
		get: function get() {
			return this.connection.db;
		}
	}, {
		key: 'options',
		get: function get() {
			return this._options;
		}
	}]);

	return Model;
})(_events.EventEmitter);

exports['default'] = Model;
module.exports = exports['default'];