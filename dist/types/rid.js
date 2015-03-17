"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var StringType = _interopRequire(require("./string"));

var _ = _interopRequire(require("lodash"));

var RIDType = (function (_StringType) {
	function RIDType() {
		_classCallCheck(this, RIDType);

		if (_StringType != null) {
			_StringType.apply(this, arguments);
		}
	}

	_inherits(RIDType, _StringType);

	_createClass(RIDType, {
		_serialize: {
			value: function _serialize(value) {
				if (_.isPlainObject(value)) {
					value = RIDType.objectToString(value);
				} else if (value && value["@rid"]) {
					value = value["@rid"];
				}

				return _get(Object.getPrototypeOf(RIDType.prototype), "_serialize", this).call(this, value);
			}
		}
	}, {
		getDbType: {
			value: function getDbType(options) {
				return "LINK";
			}
		},
		objectToString: {
			value: function objectToString(obj) {
				if (obj && typeof obj.cluster !== "undefined" && typeof obj.position !== "undefined") {
					return "#" + obj.cluster + ":" + obj.position;
				}

				return null;
			}
		}
	});

	return RIDType;
})(StringType);

module.exports = RIDType;