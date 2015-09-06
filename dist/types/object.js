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

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var ObjectType = (function (_Type) {
	_inherits(ObjectType, _Type);

	function ObjectType(data, prop, name, mainData) {
		_classCallCheck(this, ObjectType);

		_get(Object.getPrototypeOf(ObjectType.prototype), 'constructor', this).call(this, data, prop, name, mainData);

		this._schema = prop.type;

		this._value = new this._schema.DataClass({}, this._computeClassName(data, prop), mainData);
	}

	_createClass(ObjectType, [{
		key: '_computeClassName',
		value: function _computeClassName(data, prop) {
			var schemaType = prop.schemaType;
			var options = prop.options;
			var className = data._className;
			var type = schemaType.getDbType(options);
			var propType = prop.type;
			if (propType._options.className || options.className) {
				return propType._options.className || options.className;
			}
			if (type === 'EMBEDDED' && schemaType.isObject) {
				return className + 'A' + _lodash2['default'].capitalize(this.name);
			} else if (type === 'EMBEDDEDLIST' && schemaType.isArray && prop.item) {
				var item = prop.item;
				if (item.schemaType.isObject) {
					return className + 'A' + _lodash2['default'].capitalize(propName);
				}
			}

			return;
		}
	}, {
		key: 'set',
		value: function set(key, value) {
			this._value[key] = value;
		}
	}, {
		key: '_serialize',
		value: function _serialize(props) {
			for (var propName in props) {
				this.set(propName, props[propName]);
			}
			return this._value;
		}
	}, {
		key: '_deserialize',
		value: function _deserialize() {
			return this._value;
		}
	}, {
		key: 'toJSON',
		value: function toJSON(options) {
			return this._value.toJSON(options);
		}
	}, {
		key: 'toObject',
		value: function toObject(options) {
			return this._value.toObject(options);
		}
	}, {
		key: 'isModified',
		get: function get() {
			var isModified = false;

			this._value.forEach(true, function (prop) {
				if (prop.isModified) {
					isModified = true;
				}
			});

			return isModified;
		}
	}], [{
		key: 'getDbType',
		value: function getDbType(options) {
			return 'EMBEDDED';
		}
	}, {
		key: 'toString',
		value: function toString() {
			return 'Object';
		}
	}, {
		key: 'isObject',
		get: function get() {
			return true;
		}
	}]);

	return ObjectType;
})(_type2['default']);

exports['default'] = ObjectType;
module.exports = exports['default'];