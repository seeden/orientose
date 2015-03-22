"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _index = require("./index");

var OrientSchema = _interopRequire(_index);

var prepareSchema = _index.prepareSchema;

var VertexSchema = _interopRequire(require("../vertex"));

var V = (function (_VertexSchema) {
	function V(props, options) {
		_classCallCheck(this, V);

		options = options || {};
		options.extend = options.extend || "V";

		_get(Object.getPrototypeOf(V.prototype), "constructor", this).call(this, props, options);

		prepareSchema(this);
	}

	_inherits(V, _VertexSchema);

	return V;
})(VertexSchema);

module.exports = V;