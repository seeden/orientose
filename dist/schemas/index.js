'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _kareem = require('kareem');

var _kareem2 = _interopRequireDefault(_kareem);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _typesVirtual = require('../types/virtual');

var _typesVirtual2 = _interopRequireDefault(_typesVirtual);

var _data = require('../data');

var _data2 = _interopRequireDefault(_data);

var _types = require('../types');

var _types2 = _interopRequireDefault(_types);

var _typesConvert = require('../types/convert');

var _typesConvert2 = _interopRequireDefault(_typesConvert);

var _typesMixed = require('../types/mixed');

var _typesMixed2 = _interopRequireDefault(_typesMixed);

var _constantsIndextype = require('../constants/indextype');

var _constantsIndextype2 = _interopRequireDefault(_constantsIndextype);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var log = (0, _debug2['default'])('orientose:schema');

var Schema = (function (_EventEmitter) {
	_inherits(Schema, _EventEmitter);

	function Schema(props, options) {
		_classCallCheck(this, Schema);

		_get(Object.getPrototypeOf(Schema.prototype), 'constructor', this).call(this);

		props = props || {};

		this.methods = {};
		this.statics = {};

		this._props = {};
		this._options = options || {};

		this._paths = {};
		this._indexes = {};
		this._virtuals = {};
		this._hooks = new _kareem2['default']();

		this._dataClass = null;

		this.add(props);
	}

	_createClass(Schema, [{
		key: 'add',
		value: function add(props) {
			var _this = this;

			if (!_lodash2['default'].isObject(props)) {
				throw new Error('Props is not an object');
			}

			Object.keys(props).forEach(function (propName) {
				return _this.setPath(propName, props[propName]);
			});
			return this;
		}
	}, {
		key: 'getSubdocumentSchemaConstructor',
		value: function getSubdocumentSchemaConstructor() {
			return Schema;
		}
	}, {
		key: '_indexName',
		value: function _indexName(properties) {
			var props = Object.keys(properties).map(function (prop) {
				return prop.replace('.', '-');
			});

			return props.join('_');
		}
	}, {
		key: 'index',
		value: function index(properties, options) {
			options = options || {};

			if (typeof properties === 'string') {
				properties = _defineProperty({}, properties, 1);
			}

			var name = options.name || this._indexName(properties);
			var type = options.type || _constantsIndextype2['default'].NOTUNIQUE;
			if (options.unique) {
				type = _constantsIndextype2['default'].UNIQUE;
			} else if (options.text) {
				type = _constantsIndextype2['default'].FULLTEXT;
			}

			if (this._indexes[name]) {
				throw new Error('Index with name ${name} is already defined.');
			}

			//fix 2dsphere index from mongoose
			if (type.toUpperCase() === '2DSPHERE') {
				type = 'SPATIAL ENGINE LUCENE';

				var keys = Object.keys(properties);
				if (keys.length !== 1) {
					throw new Error('We can not fix index on multiple properties');
				}

				properties = _defineProperty({}, keys[0] + '.coordinates', 1);
			}

			this._indexes[name] = {
				properties: properties,
				type: type,
				nullValuesIgnored: !options.sparse,
				options: options
			};

			return this;
		}
	}, {
		key: 'hasIndex',
		value: function hasIndex(name) {
			return !!this._indexes[name];
		}
	}, {
		key: 'getIndex',
		value: function getIndex(name) {
			return this._indexes[name];
		}
	}, {
		key: 'get',
		value: function get(key) {
			return this.options[key];
		}
	}, {
		key: 'set',
		value: function set(key, value) {
			this.options[key] = value;
			return this;
		}
	}, {
		key: 'getSchemaType',
		value: function getSchemaType(path) {
			var prop = this.getPath(path);
			return prop ? prop.schemaType : void 0;
		}
	}, {
		key: 'getPath',
		value: function getPath(path, stopOnArray) {
			var pos = path.indexOf('.');
			if (pos === -1) {
				return this._props[path];
			}

			var subPath = path.substr(pos + 1);
			var propName = path.substr(0, pos);

			var prop = this._props[propName];
			if (!prop) {
				return prop;
			}

			if (prop.type.isSchema) {
				return prop.type.getPath(subPath);
			}

			if (!stopOnArray && prop.item && prop.item.type.isSchema) {
				return prop.item.type.getPath(subPath);
			}
		}
	}, {
		key: 'setPath',
		value: function setPath(path, options) {
			// ignore {_id: false}
			if (options === false) {
				return this;
			}

			options = options || {};

			var pos = path.indexOf('.');
			if (pos === -1) {
				try {
					var normalizedOptions = this.normalizeOptions(options);
				} catch (e) {
					log('Problem with path: ' + path);
					throw e;
				}

				if (!normalizedOptions) {
					return this;
				}

				this._props[path] = normalizedOptions;

				if (!options.index) {
					return this;
				}

				this.index(_defineProperty({}, path, path), {
					name: options.indexName,
					unique: options.unique,
					sparse: options.sparse,
					type: options.indexType
				});

				return this;
			}

			var subPath = path.substr(pos + 1);
			var propName = path.substr(0, pos);

			var prop = this._props[propName];
			if (prop && prop.type.isSchema) {
				prop.type.setPath(subPath, options);
			}

			return this;
		}
	}, {
		key: 'has',
		value: function has(property) {
			return !!this._props[property];
		}
	}, {
		key: 'propertyNames',
		value: function propertyNames() {
			return Object.keys(this._props);
		}
	}, {
		key: 'method',
		value: function method(name, fn) {
			if (_lodash2['default'].isObject(name)) {
				for (var index in name) {
					this.methods[index] = name[index];
				}
				return;
			}

			this.methods[name] = fn;
			return this;
		}
	}, {
		key: 'static',
		value: function _static(name, fn) {
			if (_lodash2['default'].isObject(name)) {
				for (var index in name) {
					this.statics[index] = name[index];
				}
				return;
			}

			this.statics[name] = fn;
			return this;
		}
	}, {
		key: 'virtual',
		value: function virtual(path, options) {
			options = options || {};

			var schema = this;
			var pos = path.indexOf('.');
			if (pos !== -1) {
				var subPaths = path.split('.');
				var path = subPaths.pop();

				var prop = this.getPath(subPaths.join('.'));
				if (!prop) {
					throw new Error('Field does not exists ' + subPaths.join('.'));
				}

				var type = prop.item ? prop.item.type : prop.type;

				if (!type || !type.isSchema) {
					throw new Error('Field does not exists ' + subPaths.join('.'));
				}

				return type.virtual(path, options);
			}

			if (this._virtuals[path]) {
				return this._virtuals[path].getset;
			}

			var virtual = this._virtuals[path] = {
				schemaType: _typesVirtual2['default'],
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

			return virtual.getset;
		}
	}, {
		key: 'alias',
		value: function alias(to, from) {
			this.virtual(from).get(function () {
				return this[to];
			}).set(function (value) {
				this[to] = value;
			});

			return this;
		}
	}, {
		key: 'pre',
		value: function pre(name, async, fn) {
			this._hooks.pre(name, async, fn);
			return this;
		}
	}, {
		key: 'post',
		value: function post(name, async, fn) {
			this._hooks.post(name, async, fn);
			return this;
		}
	}, {
		key: 'plugin',
		value: function plugin(pluginFn, options) {
			options = options || {};

			pluginFn(this, options);
			return this;
		}
	}, {
		key: 'path',
		value: function path(_path) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			if (args.length === 0) {
				var prop = this.getPath(_path, true);
				if (!prop) {
					return prop;
				}

				return Schema.toMongoose(prop, _path);
			}

			this.setPath(_path, args[0]);
			return this;
		}
	}, {
		key: 'traverse',
		value: function traverse(fn, traverseChildren, parentPath) {
			var props = this._props;
			var virtuals = this._virtuals;

			Object.keys(props).forEach(function (name) {
				var prop = props[name];
				var path = parentPath ? parentPath + '.' + name : name;

				var canTraverseChildren = fn(name, prop, path, false);
				if (canTraverseChildren === false) {
					return;
				}

				if (prop.type.isSchema) {
					prop.type.traverse(fn, traverseChildren, path);
				}

				if (prop.item && prop.item.type.isSchema) {
					prop.item.type.traverse(fn, traverseChildren, path);
				}
			});

			//traverse virtual poroperties
			Object.keys(virtuals).forEach(function (name) {
				var prop = virtuals[name];
				var path = parentPath ? parentPath + '.' + name : name;

				fn(name, prop, path, true);
			});

			return this;
		}
	}, {
		key: 'eachPath',
		value: function eachPath(fn) {
			this.traverse(function (name, prop, path, isVirtual) {
				if (isVirtual) {
					return false;
				}

				var config = Schema.toMongoose(prop, path);
				if (!config) {
					return;
				}

				fn(path, config);

				if (prop.item) {
					return false;
				}
			});
		}
	}, {
		key: 'normalizeOptions',
		value: function normalizeOptions(options) {
			if (!options) {
				return null;
			}

			//convert basic types
			var basicTypes = [String, Number, Boolean, Date];
			if (basicTypes.indexOf(options) !== -1) {
				options = {
					type: options
				};
			}

			//if it is one of our types
			if (_lodash2['default'].isFunction(options)) {
				options = {
					type: options
				};
			}

			//1. convert objects
			if (_lodash2['default'].isPlainObject(options) && (!options.type || options.type.type)) {
				options = {
					type: options
				};
			}

			//2. prepare array
			if (_lodash2['default'].isArray(options)) {
				options = {
					type: options
				};
			}

			var type = options.isSchema ? options : options.type;
			var SubSchema = this.getSubdocumentSchemaConstructor();

			//create schema from plain object
			if (_lodash2['default'].isPlainObject(type)) {
				type = Object.keys(type).length ? new SubSchema(type) : _typesMixed2['default'];
			}

			if (_lodash2['default'].isString(type)) {
				var ttype = type.toLowerCase();
				for (var name in _types2['default']) {
					var tname = name.toLowerCase();
					if (ttype === tname) {
						type = _types2['default'][name];
						break;
					}
				}
			}

			var normalised = {
				schema: this,
				type: type,
				schemaType: (0, _typesConvert2['default'])(type),
				options: options
			};

			if (_lodash2['default'].isArray(type)) {
				var itemOptions = type.length ? type[0] : { type: _typesMixed2['default'] };
				normalised.item = this.normalizeOptions(itemOptions);
			}

			return normalised;
		}
	}, {
		key: 'extendClassName',
		get: function get() {
			return this._options.extend;
		}
	}, {
		key: 'hooks',
		get: function get() {
			return this._hooks;
		}
	}, {
		key: 'options',
		get: function get() {
			return this._options;
		}
	}, {
		key: 'DataClass',
		get: function get() {
			if (!this._dataClass) {
				this._dataClass = _data2['default'].createClass(this);
			}
			return this._dataClass;
		}
	}, {
		key: 'indexNames',
		get: function get() {
			return Object.keys(this._indexes);
		}
	}, {
		key: 'isSchema',
		get: function get() {
			return true;
		}
	}], [{
		key: 'toMongoose',
		value: function toMongoose(prop, path) {
			var options = prop.options || {};

			if (prop.type.isSchema) {
				return;
			}

			var config = {
				path: path,
				instance: prop.schemaType.toString(),
				setters: [],
				getters: [],
				options: options,
				defaultValue: options['default']
			};

			if (prop.item) {
				if (prop.item.type.isSchema) {
					config.schema = prop.item.type;
				}
			}

			return config;
		}
	}]);

	return Schema;
})(_events.EventEmitter);

exports['default'] = Schema;
module.exports = exports['default'];