"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Type = _interopRequire(require("./type"));

var DateType = (function (Type) {
	function DateType() {
		_classCallCheck(this, DateType);

		if (Type != null) {
			Type.apply(this, arguments);
		}
	}

	_inherits(DateType, Type);

	_prototypeProperties(DateType, {
		getDbType: {
			value: function getDbType(options) {
				return "DATETIME";
			},
			writable: true,
			configurable: true
		}
	}, {
		_serialize: {
			value: function _serialize(value) {
				return new Date(value);
			},
			writable: true,
			configurable: true
		},
		_deserialize: {
			value: function _deserialize(value) {
				return value;
			},
			writable: true,
			configurable: true
		},
		toJSON: {
			value: function toJSON(options) {
				var value = this.value;
				return value && value.getTime ? value.getTime() : value.value;
			},
			writable: true,
			configurable: true
		}
	});

	return DateType;
})(Type);

module.exports = DateType;