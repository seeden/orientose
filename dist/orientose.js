'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _connection = require('./connection');

var _connection2 = _interopRequireDefault(_connection);

var _schemasOrient = require('./schemas/orient');

var _schemasOrient2 = _interopRequireDefault(_schemasOrient);

var _schemasOrientV = require('./schemas/orient/v');

var _schemasOrientV2 = _interopRequireDefault(_schemasOrientV);

var _schemasOrientE = require('./schemas/orient/e');

var _schemasOrientE2 = _interopRequireDefault(_schemasOrientE);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _typesIndex = require('./types/index');

var _typesIndex2 = _interopRequireDefault(_typesIndex);

var _orientjs = require("orientjs");

var _orientjs2 = _interopRequireDefault(_orientjs);

_schemasOrient2['default'].E = _schemasOrientE2['default'];
_schemasOrient2['default'].V = _schemasOrientV2['default'];
_schemasOrient2['default'].ObjectId = _typesIndex2['default'].Rid; //mongoose compatible

_connection2['default'].Schema = _schemasOrient2['default'];

_connection2['default'].Model = _model2['default'];
_connection2['default'].Type = _typesIndex2['default'];
_connection2['default'].Oriento = _orientjs2['default'];

var RawType = (function () {
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
})();

_connection2['default'].RawType = RawType;
_connection2['default'].raw = function (raw) {
	return new RawType(raw);
};

exports['default'] = _connection2['default'];
module.exports = exports['default'];