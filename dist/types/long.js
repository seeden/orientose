"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Type = _interopRequire(require("./type"));

var _ = _interopRequire(require("lodash"));

/*
	Javascript long has support for 53bits only
*/

var LongType = (function (Type) {
	function LongType() {
		_classCallCheck(this, LongType);

		if (Type != null) {
			Type.apply(this, arguments);
		}
	}

	_inherits(LongType, Type);

	_prototypeProperties(LongType, {
		getDbType: {
			value: function getDbType(options) {
				return "LONG";
			},
			writable: true,
			configurable: true
		}
	}, {
		_serialize: {
			value: function _serialize(value) {
				return String(value);
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
		}
	});

	return LongType;
})(Type);

module.exports = LongType;