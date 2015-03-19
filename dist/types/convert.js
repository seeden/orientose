"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Type = _interopRequire(require("./type"));

var StringType = _interopRequire(require("./string"));

var NumberType = _interopRequire(require("./number"));

var BooleanType = _interopRequire(require("./boolean"));

var DateType = _interopRequire(require("./date"));

var ObjectType = _interopRequire(require("./object"));

var ArrayType = _interopRequire(require("./array"));

var _ = _interopRequire(require("lodash"));

module.exports = function (type) {
	if (!type) {
		throw new Error("Type is not defined");
	} else if (type.isSchemaType) {
		return type;
	} else if (type.isSchema) {
		return ObjectType;
	} else if (_.isArray(type)) {
		return ArrayType;
	} else if (type === String) {
		return StringType;
	} else if (type === Number) {
		return NumberType;
	} else if (type === Boolean) {
		return BooleanType;
	} else if (type === Date) {
		return DateType;
	}

	throw new Error("Unrecognized type");
};