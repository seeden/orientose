"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var IntegerType = _interopRequire(require("./integer"));

var LongType = _interopRequire(require("./long"));

var NumberType = _interopRequire(require("./number"));

var StringType = _interopRequire(require("./string"));

var ArrayType = _interopRequire(require("./array"));

var MixedType = _interopRequire(require("./mixed"));

module.exports = {
	Integer: IntegerType,
	Long: LongType,
	String: StringType,
	Number: NumberType,
	EmbeddedList: ArrayType,
	Mixed: MixedType
};