'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _schemasIndex = require('../schemas/index');

var _schemasIndex2 = _interopRequireDefault(_schemasIndex);

var ArrayType = (function (_Type) {
	_inherits(ArrayType, _Type);

	function ArrayType(data, prop, name, mainData) {
		_classCallCheck(this, ArrayType);

		_get(Object.getPrototypeOf(ArrayType.prototype), 'constructor', this).call(this, data, prop, name, mainData);

		if (!prop.item) {
			throw new Error('Type of the array item is not defined');
		}

		this._original = [];
		this._value = [];
	}

	_createClass(ArrayType, [{
		key: '_createItem',
		value: function _createItem(value) {
			var item = new this.prop.item.schemaType(this.data, this.prop.item, this.name, this.mainData);
			item.value = value;

			return item;
		}
	}, {
		key: '_empty',
		value: function _empty() {
			this._value = [];
		}
	}, {
		key: '_serialize',
		value: function _serialize(items) {
			var _this = this;

			this._empty();

			items.forEach(function (item) {
				_this.push(item);
			});

			return this._value;
		}
	}, {
		key: '_deserialize',
		value: function _deserialize() {
			return this;
		}
	}, {
		key: 'set',
		value: function set(index, value) {
			return this._value[index] = this._createItem(value);
		}
	}, {
		key: 'push',
		value: function push(value) {
			return this._value.push(this._createItem(value));
		}
	}, {
		key: 'splice',
		value: function splice(start, count) {
			var items = [].slice.call(arguments, 2);
			var self = this;
			items = items.map(function (value) {
				return self._createItem(value);
			});
			items.splice(0, 0, start, count);
			return this._value.splice.apply(this._value, items);
		}
	}, {
		key: 'pop',
		value: function pop() {
			var item = this._value.pop();
			return item ? item.value : item;
		}
	}, {
		key: 'get',
		value: function get(i) {
			return this._value[i];
		}
	}, {
		key: 'forEach',
		value: function forEach(fn) {
			return this._value.forEach(function (item) {
				fn(item.value);
			});
		}
	}, {
		key: 'map',
		value: function map(fn) {
			return this._value.map(function (item) {
				return fn(item.value);
			});
		}
	}, {
		key: 'toJSON',
		value: function toJSON(options) {
			return this._value.map(function (item) {
				return item.toJSON(options);
			});
		}
	}, {
		key: 'toObject',
		value: function toObject(options) {
			return this._value.map(function (item) {
				return item.toObject(options);
			});
		}
	}, {
		key: 'length',
		get: function get() {
			return this._value.length;
		}
	}, {
		key: 'isModified',
		get: function get() {
			if (this._original.length !== this._value.length) {
				return true;
			}

			var isModified = false;
			this._value.forEach(function (prop) {
				if (prop.isModified) {
					isModified = true;
				}
			});

			return isModified;
		}
	}], [{
		key: 'toString',
		value: function toString() {
			return 'Array';
		}
	}, {
		key: 'getDbType',
		value: function getDbType(options) {
			return 'EMBEDDEDLIST';
		}
	}, {
		key: 'getPropertyConfig',
		value: function getPropertyConfig(propOptions) {
			var item = propOptions.item;

			return {
				linkedType: item.schemaType.getDbType(item.options)
			};
		}
	}, {
		key: 'isArray',
		get: function get() {
			return true;
		}
	}]);

	return ArrayType;
})(_type2['default']);

exports['default'] = ArrayType;
module.exports = exports['default'];