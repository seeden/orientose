"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports.prepareSchema = prepareSchema;
Object.defineProperty(exports, "__esModule", {
	value: true
});

var Schema = _interopRequire(require("../index"));

var RID = _interopRequire(require("../../types/rid"));

var ObjectId = _interopRequire(require("../mongoose/objectid"));

function prepareSchema(schema) {
	schema.add({
		"@type": { type: String, readonly: true, metadata: true },
		"@class": { type: String, readonly: true, metadata: true },
		"@rid": { type: RID, readonly: true, metadata: true },
		"@version": { type: Number, readonly: true, metadata: true } });

	schema.virtual("rid", { metadata: true }).get(function () {
		return this.get("@rid");
	});

	schema.virtual("_id", { metadata: true }).get(function () {
		var rid = this.get("@rid");

		if (rid) {
			return new ObjectId(rid);
		}

		return rid;
	});
}

var OrientSchema = (function (_Schema) {
	function OrientSchema(props, options) {
		_classCallCheck(this, OrientSchema);

		_get(Object.getPrototypeOf(OrientSchema.prototype), "constructor", this).call(this, props, options);

		prepareSchema(this);
	}

	_inherits(OrientSchema, _Schema);

	return OrientSchema;
})(Schema);

exports["default"] = OrientSchema;