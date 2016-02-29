'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _boolean = require('./boolean');

var _boolean2 = _interopRequireDefault(_boolean);

var _integer = require('./integer');

var _integer2 = _interopRequireDefault(_integer);

var _long = require('./long');

var _long2 = _interopRequireDefault(_long);

var _number = require('./number');

var _number2 = _interopRequireDefault(_number);

var _string = require('./string');

var _string2 = _interopRequireDefault(_string);

var _array = require('./array');

var _array2 = _interopRequireDefault(_array);

var _object = require('./object');

var _object2 = _interopRequireDefault(_object);

var _mixed = require('./mixed');

var _mixed2 = _interopRequireDefault(_mixed);

var _rid = require('./rid');

var _rid2 = _interopRequireDefault(_rid);

var _date = require('./date');

var _date2 = _interopRequireDefault(_date);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	'Boolean': _boolean2.default,
	'Integer': _integer2.default,
	'Long': _long2.default,
	'String': _string2.default,
	'Number': _number2.default,
	EmbeddedList: _array2.default,
	Mixed: _mixed2.default,
	Rid: _rid2.default,
	'Date': _date2.default,
	Embedded: _object2.default
};