"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

var RawType = (function () {
	function RawType(raw) {
		_classCallCheck(this, RawType);

		this._raw = raw;
		this.__orientose_raw__ = true;
	}

	_createClass(RawType, {
		toString: {
			value: function toString() {
				return this._raw;
			}
		}
	});

	return RawType;
})();

Connection.RawType = RawType;
Connection.raw = function (raw) {
	return new RawType(raw);
};

module.exports = Connection;