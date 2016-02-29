'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _connection = require('./connection');

var _connection2 = _interopRequireDefault(_connection);

var _orient = require('./schemas/orient');

var _orient2 = _interopRequireDefault(_orient);

var _v = require('./schemas/orient/v');

var _v2 = _interopRequireDefault(_v);

var _e = require('./schemas/orient/e');

var _e2 = _interopRequireDefault(_e);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _index = require('./types/index');

var _index2 = _interopRequireDefault(_index);

var _orientjs = require('orientjs');

var _orientjs2 = _interopRequireDefault(_orientjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_orient2.default.E = _e2.default;
_orient2.default.V = _v2.default;
_orient2.default.ObjectId = _index2.default.Rid; //mongoose compatible

_connection2.default.Schema = _orient2.default;

_connection2.default.Model = _model2.default;
_connection2.default.Type = _index2.default;
_connection2.default.Oriento = _orientjs2.default;

var RawType = function () {
	function RawType(raw) {
		_classCallCheck(this, RawType);

		this._raw = raw;
		this.__orientose_raw__ = true;
	}

	_createClass(RawType, [{
		key: 'toString',
		value: function toString() {
			return this._raw;
		}
	}]);

	return RawType;
}();

_connection2.default.RawType = RawType;
_connection2.default.raw = function (raw) {
	return new RawType(raw);
};

exports.default = _connection2.default;