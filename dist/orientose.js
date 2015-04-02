"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Connection = _interopRequire(require("./connection"));

var SchemaOrient = _interopRequire(require("./schemas/orient"));

var SchemaV = _interopRequire(require("./schemas/orient/v"));

var SchemaE = _interopRequire(require("./schemas/orient/e"));

var Model = _interopRequire(require("./model"));

var Type = _interopRequire(require("./types/index"));

var Oriento = _interopRequire(require("oriento"));

SchemaOrient.E = SchemaE;
SchemaOrient.V = SchemaV;
SchemaOrient.ObjectId = Type.Rid; //mongoose compatible

Connection.Schema = SchemaOrient;

Connection.Model = Model;
Connection.Type = Type;
Connection.Oriento = Oriento;

module.exports = Connection;