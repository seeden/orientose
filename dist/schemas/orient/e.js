"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var OrientSchema = _interopRequire(require("./index"));

var RidType = _interopRequire(require("../../types/rid"));

var BASE_EDGE_CLASS = "E";

var E = (function (OrientSchema) {
	function E(props, options) {
		_classCallCheck(this, E);

		options = options || {};
		options.extend = options.extend || BASE_EDGE_CLASS;

		_get(Object.getPrototypeOf(E.prototype), "constructor", this).call(this, props, options);

		//add default properties
		this.add({
			"in": { type: RidType, required: true, notNull: true }, //from
			out: { type: RidType, required: true, notNull: true } //to
		});

		this.alias("in", "from");
		this.alias("out", "to");

		if (options.unique) {
			this.index({
				"in": 1,
				out: 1
			}, { unique: true });
		}
	}

	_inherits(E, OrientSchema);

	_prototypeProperties(E, null, {
		isEdge: {
			get: function () {
				return true;
			},
			configurable: true
		}
	});

	return E;
})(OrientSchema);

module.exports = E;