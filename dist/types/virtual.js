"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Type = _interopRequire(require("./type"));

var Virtual = (function (Type) {
	function Virtual(data, options) {
		_classCallCheck(this, Virtual);

		_get(Object.getPrototypeOf(Virtual.prototype), "constructor", this).call(this, data, options);
	}

	_inherits(Virtual, Type);

	_prototypeProperties(Virtual, null, {
		_serialize: {
			value: function _serialize(value) {
				this.applySet(this.data, value);
			},
			writable: true,
			configurable: true
		},
		_deserialize: {
			value: function _deserialize() {
				return this.applyGet(this.data);
			},
			writable: true,
			configurable: true
		},
		applyGet: {
			value: function applyGet(scope) {
				if (!this.options.get) {
					throw new Error("Getter is not defined");
				}

				return this.options.get.call(scope, this);
			},
			writable: true,
			configurable: true
		},
		applySet: {
			value: function applySet(scope, value) {
				if (!this.options.set) {
					throw new Error("Setter is not defined");
				}

				this.options.set.call(scope, value, this);
				return this;
			},
			writable: true,
			configurable: true
		}
	});

	return Virtual;
})(Type);

module.exports = Virtual;