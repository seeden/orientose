"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var EventEmitter = require("events").EventEmitter;

var Kareem = _interopRequire(require("kareem"));

var _ = _interopRequire(require("lodash"));

var VirtualType = _interopRequire(require("../types/virtual"));

var Data = _interopRequire(require("../data"));

var convertType = _interopRequire(require("../types/convert"));

var MixedType = _interopRequire(require("../types/mixed"));

var IndexType = _interopRequire(require("../constants/indextype"));

/*
{
	extend: 'V'
}
*/

var Schema = (function (EventEmitter) {
	function Schema(props, options) {
		_classCallCheck(this, Schema);

		_get(Object.getPrototypeOf(Schema.prototype), "constructor", this).call(this);

		props = props || {};

		this.methods = {};
		this.statics = {};

		this._props = {};
		this._options = options || {};

		this._paths = {};
		this._indexes = {};
		this._virtuals = {};
		this._hooks = new Kareem();

		this._dataClass = null;

		this.add(props);
	}

	_inherits(Schema, EventEmitter);

	_prototypeProperties(Schema, {
		normalizeOptions: {
			value: function normalizeOptions(options) {
				//1. convert objects
				if (!options.type && _.isPlainObject(options)) {
					options = {
						type: options
					};
				}

				//2. prepare array
				if (_.isArray(options)) {
					options = {
						type: options
					};
				}

				options.type = Schema.normalizeType(options.type);

				return {
					schemaType: convertType(options.type),
					options: options
				};
			},
			writable: true,
			configurable: true
		},
		normalizeType: {
			value: function normalizeType(type) {
				//automatically prepare schema for plain objects
				if (_.isPlainObject(type)) {
					type = new Schema(type);
				}

				if (_.isArray(type)) {
					if (!type.length) {
						type = [MixedType];
					} else if (type.length !== 1) {
						throw new Error("Type of an array item is undefined");
					}

					var itemOptions = type[0];
					if (!_.isPlainObject(itemOptions)) {
						itemOptions = {
							type: itemOptions
						};
					}

					var normalisedOptions = Schema.normalizeOptions(itemOptions);
					type.schemaType = normalisedOptions.schemaType;
					type.options = normalisedOptions.options;
				}

				return type;
			},
			writable: true,
			configurable: true
		}
	}, {
		extendClassName: {
			get: function () {
				return this._options.extend;
			},
			configurable: true
		},
		hooks: {
			get: function () {
				return this._hooks;
			},
			configurable: true
		},
		DataClass: {
			get: function () {
				if (!this._dataClass) {
					this._dataClass = Data.createClass(this);
				}
				return this._dataClass;
			},
			configurable: true
		},
		add: {
			value: function add(props) {
				if (!_.isObject(props)) {
					throw new Error("Props is not an object");
				}

				for (var propName in props) {
					this.set(propName, props[propName]);
				}

				return this;
			},
			writable: true,
			configurable: true
		},
		_indexName: {
			value: function _indexName(properties) {
				var props = Object.keys(properties).map(function (prop) {
					return prop.replace(".", "-");
				});

				return props.join("_");
			},
			writable: true,
			configurable: true
		},
		index: {
			value: function index(properties, options) {
				options = options || {};

				if (typeof properties === "string") {
					properties = _defineProperty({}, properties, 1);
				}

				var name = options.name || this._indexName(properties);
				var type = options.type || IndexType.NOTUNIQUE;
				if (options.unique) {
					type = IndexType.UNIQUE;
				} else if (options.text) {
					type = IndexType.FULLTEXT;
				}

				if (this._indexes[name]) {
					throw new Error("Index with name ${name} is already defined.");
				}

				//fix 2dsphere index from mongoose
				if (type.toUpperCase() === "2DSPHERE") {
					type = "SPATIAL ENGINE LUCENE";

					var keys = Object.keys(properties);
					if (keys.length !== 1) {
						throw new Error("We can not fix index on multiple properties");
					}

					properties = _defineProperty({}, keys[0] + ".coordinates", 1);
				}

				this._indexes[name] = {
					properties: properties,
					type: type,
					nullValuesIgnored: !options.sparse,
					options: options
				};

				return this;
			},
			writable: true,
			configurable: true
		},
		hasIndex: {
			value: function hasIndex(name) {
				return !!this._indexes[name];
			},
			writable: true,
			configurable: true
		},
		getIndex: {
			value: function getIndex(name) {
				return this._indexes[name];
			},
			writable: true,
			configurable: true
		},
		indexNames: {
			get: function () {
				return Object.keys(this._indexes);
			},
			configurable: true
		},
		get: {

			/**
   */

			value: function get(propName) {
				var pos = propName.indexOf(".");
				if (pos === -1) {
					if (!this._props[propName]) {
						return;
					}

					return this._props[propName].options;
				}

				var nextPath = propName.substr(pos + 1);
				propName = propName.substr(0, pos);

				var prop = this._props[propName];
				if (!prop) {
					return;
				}

				var type = prop.options.type;
				if (!type.isSchema) {
					return;
				}

				return type.get(nextPath);
			},
			writable: true,
			configurable: true
		},
		getSchemaType: {
			value: function getSchemaType(property) {
				return this._props[property].schemaType;
			},
			writable: true,
			configurable: true
		},
		set: {
			value: function set(propName, options) {
				options = options || {};

				var pos = propName.indexOf(".");
				if (pos === -1) {
					this._props[propName] = Schema.normalizeOptions(options);

					if (!options.index) {
						return this;
					}

					this.index(_defineProperty({}, propName, propName), {
						name: options.indexName,
						unique: options.unique,
						sparse: options.sparse,
						type: options.indexType
					});

					return this;
				}

				var nextPath = propName.substr(pos + 1);
				propName = propName.substr(0, pos);

				var prop = this._props[propName];
				if (!prop) {
					return;
				}

				var type = prop.options.type;
				if (!type.isSchema) {
					return;
				}

				return type.set(nextPath, options);
			},
			writable: true,
			configurable: true
		},
		has: {
			value: function has(property) {
				return !!this._props[property];
			},
			writable: true,
			configurable: true
		},
		propertyNames: {
			value: function propertyNames() {
				return Object.keys(this._props);
			},
			writable: true,
			configurable: true
		},
		method: {
			value: function method(name, fn) {
				if (_.isObject(name)) {
					for (var index in name) {
						this.methods[index] = name[index];
					}
					return;
				}

				this.methods[name] = fn;
				return this;
			},
			writable: true,
			configurable: true
		},
		"static": {
			value: function _static(name, fn) {
				if (_.isObject(name)) {
					for (var index in name) {
						this.statics[index] = name[index];
					}
					return;
				}

				this.statics[name] = fn;
				return this;
			},
			writable: true,
			configurable: true
		},
		virtual: {
			value: function virtual(name, options) {
				options = options || {};

				if (name.indexOf(".") !== -1) {
					throw new Error("You can not set virtual method for subdocument in this way. Please use subschemas.");
				}

				if (!this._virtuals[name]) {
					this._virtuals[name] = {
						schemaType: VirtualType,
						options: options,
						getset: {
							get: function get(fn) {
								options.get = fn;
								return this;
							},
							set: function set(fn) {
								options.set = fn;
								return this;
							}
						}
					};
				}

				return this._virtuals[name].getset;
			},
			writable: true,
			configurable: true
		},
		alias: {
			value: function alias(to, from) {
				this.virtual(from).get(function () {
					return this[to];
				}).set(function (value) {
					this[to] = value;
				});

				return this;
			},
			writable: true,
			configurable: true
		},
		pre: {
			value: function pre(name, async, fn) {
				this._hooks.pre(name, async, fn);
				return this;
			},
			writable: true,
			configurable: true
		},
		post: {
			value: function post(name, async, fn) {
				this._hooks.post(name, async, fn);
				return this;
			},
			writable: true,
			configurable: true
		},
		traverse: {
			value: function traverse(fn, traverseChildren, skipObjects, parentPath) {
				var props = this._props;
				var virtuals = this._virtuals;

				for (var name in props) {
					if (!props.hasOwnProperty(name)) {
						continue;
					}

					var prop = props[name];
					var currentPath = parentPath ? parentPath + "." + name : name;
					var propType = prop.options.type;
					var isSchema = propType && propType.isSchema;

					fn(name, prop, currentPath, false);

					if (traverseChildren && isSchema) {
						propType.traverse(fn, traverseChildren, skipObjects, currentPath);
					}
				}

				//traverse virtual poroperties
				for (var name in virtuals) {
					if (!virtuals.hasOwnProperty(name)) {
						continue;
					}

					var prop = virtuals[name];
					var currentPath = parentPath ? parentPath + "." + name : name;

					fn(name, prop, currentPath, true);
				}

				return this;
			},
			writable: true,
			configurable: true
		},
		plugin: {
			value: function plugin(pluginFn, options) {
				options = options || {};

				pluginFn(this, options);
				return this;
			},
			writable: true,
			configurable: true
		},
		isSchema: {
			get: function () {
				return true;
			},
			configurable: true
		},
		path: {
			value: (function (_path) {
				var _pathWrapper = function path(_x, _x2) {
					return _path.apply(this, arguments);
				};

				_pathWrapper.toString = function () {
					return _path.toString();
				};

				return _pathWrapper;
			})(function (path, options) {
				if (typeof this.options !== "undefined") {
					this.set(path, options);
					return this;
				}

				return this.get(path).type;
			}),
			writable: true,
			configurable: true
		},
		eachPath: {
			value: function eachPath(fn) {
				this.traverse(function (name, prop, path, isVirtual) {
					var options = prop.options;
					var type = options.type;

					var config = {
						options: options
					};

					if (type.isSchema) {
						config.schema = options.type;
					}

					fn(path, config);
				});
			},
			writable: true,
			configurable: true
		}
	});

	return Schema;
})(EventEmitter);

module.exports = Schema;