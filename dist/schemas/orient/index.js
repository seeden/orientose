"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

function getDefaultClassName() {
	return this._className;
}

function prepareSchema(schema) {
	schema.add({
		"@type": { type: String, readonly: true, metadata: true, query: true, "default": "document" },
		"@class": { type: String, readonly: true, metadata: true, query: true, "default": getDefaultClassName },
		"@rid": { type: RID, readonly: true, metadata: true },
		version: { type: Number, readonly: true, metadata: true } });

	schema.virtual("rid", { metadata: true }).get(function () {
		return this.get("@rid");
	});

	var _id = schema.virtual("_id", { metadata: true });
	var version = schema.virtual("@version", { metadata: true });
	version.get(function () {
		return this.get("version");
	});

	_id.get(function () {
		return this.get("@rid");
	});
	_id.set(function (id) {
		return this.set("@rid");
	});
	var id = schema.virtual("id", { metadata: true });
	id.get(function () {
		return this.get("@rid").toString().substr(1);
	});
	id.set(function (id) {
		if (id[0] !== "#") {
			id = "#" + id;
		}
		return this.set("@rid", id);
	});
}

var OrientSchema = (function (_Schema) {
	function OrientSchema(props, options) {
		_classCallCheck(this, OrientSchema);

		_get(Object.getPrototypeOf(OrientSchema.prototype), "constructor", this).call(this, props, options);

		prepareSchema(this);
	}

	_inherits(OrientSchema, _Schema);

	_createClass(OrientSchema, {
		getSubdocumentSchemaConstructor: {
			value: function getSubdocumentSchemaConstructor() {
				return OrientSchema;
			}
		}
	});

	return OrientSchema;
})(Schema);

exports["default"] = OrientSchema;