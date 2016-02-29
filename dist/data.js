'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('./schemas/index');

var _index2 = _interopRequireDefault(_index);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _virtual = require('./types/virtual');

var _virtual2 = _interopRequireDefault(_virtual);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = (0, _debug2.default)('orientose:data');

var Data = function () {
	function Data(schema, properties, className, mainData) {
		var _this = this;

		_classCallCheck(this, Data);

		properties = properties || {};
		mainData = mainData || this;

		this._schema = schema;
		this._data = {};
		this._className = className;
		this._mainData = mainData;

		schema.traverse(function (propName, prop) {
			_this._data[propName] = new prop.schemaType(_this, prop, propName, mainData);
		});

		this.set(properties);
	}

	_createClass(Data, [{
		key: 'forEach',
		value: function forEach(returnType, fn) {
			var _this2 = this;

			if (typeof returnType === 'function') {
				fn = returnType;
				returnType = false;
			}

			Object.keys(this._data).forEach(function (key) {
				var value = returnType ? _this2._data[key] : _this2.get(key);
				fn(value, key);
			});
		}
	}, {
		key: 'toJSON',
		value: function toJSON(options) {
			var json = {};

			options = options || {};

			for (var propName in this._data) {
				var prop = this._data[propName];

				if (prop instanceof _virtual2.default && options.virtuals === false) {
					continue;
				}

				if (options.metadata === false && prop.isMetadata) {
					continue;
				}

				if (options.modified && !prop.isModified && !prop.hasDefault) {
					continue;
				}

				json[propName] = prop.toJSON(options);
			}

			return json;
		}
	}, {
		key: 'toObject',
		value: function toObject(options) {
			var json = {};

			options = options || {};

			for (var propName in this._data) {
				var prop = this._data[propName];

				if (prop instanceof _virtual2.default) {
					continue;
				}

				if (prop.isMetadata && !options.query) {
					continue;
				}

				if (options.modified && !prop.isModified && !prop.hasDefault) {
					continue;
				}

				json[propName] = prop.toObject(options);
			}

			return json;
		}
	}, {
		key: 'isModified',
		value: function isModified(path) {
			var pos = path.indexOf('.');
			if (pos === -1) {
				if (!this._data[path]) {
					log('isModified Path not exists:' + path);
					return;
				}

				return this._data[path].isModified;
			}

			var currentKey = path.substr(0, pos);
			var newPath = path.substr(pos + 1);

			if (!this._data[currentKey]) {
				log('isModified deep Path not exists:' + currentKey);
				return;
			}

			var data = this._data[currentKey].value;
			if (!data || !data.get) {
				return;
				throw new Error('Subdocument is not defined or it is not an object');
			}

			return data.get(newPath);
		}
	}, {
		key: 'get',
		value: function get(path) {
			var pos = path.indexOf('.');
			if (pos === -1) {
				if (!this._data[path]) {
					log('get Path not exists:' + path);
					return;
				}

				return this._data[path].value;
			}

			var currentKey = path.substr(0, pos);
			var newPath = path.substr(pos + 1);

			if (!this._data[currentKey]) {
				log('get deep Path not exists:' + currentKey, path, newPath);
				return;
			}

			var data = this._data[currentKey].value;
			if (!data || !data.get) {
				return;
				throw new Error('Subdocument is not defined or it is not an object');
			}

			return data.get(newPath);
		}
	}, {
		key: 'set',
		value: function set(path, value, setAsOriginal) {
			if (_lodash2.default.isPlainObject(path)) {
				for (var key in path) {
					this.set(key, path[key], setAsOriginal);
				}
				return this;
			}

			var pos = path.indexOf('.');
			if (pos === -1) {
				var property = this._data[path];
				if (!property) {
					log('set Path not exists:' + path);
					return this;
				}

				property.value = value;
				if (setAsOriginal) {
					property.setAsOriginal();
				}
				return this;
			}

			var currentKey = path.substr(0, pos);
			var newPath = path.substr(pos + 1);

			if (!this._data[currentKey]) {
				log('set deep Path not exists:' + currentKey);
				return;
			}

			var data = this._data[currentKey].value;
			if (!data || !data.set) {
				return this;
				throw new Error('Subdocument is not defined or it is not an object');
			}

			data.set(newPath, value, setAsOriginal);
			return this;
		}
	}, {
		key: 'setupData',
		value: function setupData(properties) {
			this.set(properties, null, true);
		}
	}], [{
		key: 'createClass',
		value: function createClass(schema) {
			var DataClass = function (_Data) {
				_inherits(DataClass, _Data);

				function DataClass(properties, className, mainData) {
					_classCallCheck(this, DataClass);

					return _possibleConstructorReturn(this, Object.getPrototypeOf(DataClass).call(this, schema, properties, className, mainData));
				}

				return DataClass;
			}(Data);

			;

			//define properties
			schema.traverse(function (fieldName) {
				Object.defineProperty(DataClass.prototype, fieldName, {
					enumerable: true,
					configurable: true,
					get: function get() {
						return this.get(fieldName);
					},
					set: function set(value) {
						return this.set(fieldName, value);
					}
				});
			});

			return DataClass;
		}
	}]);

	return Data;
}();

exports.default = Data;