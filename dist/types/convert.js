'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (type) {
	if (!type) {
		throw new Error('Type is not defined');
	} else if (type.isSchemaType) {
		return type;
	} else if (type.isSchema) {
		return _object2.default;
	} else if (_lodash2.default.isArray(type)) {
		return _array2.default;
	} else if (type === String) {
		return _string2.default;
	} else if (type === Number) {
		return _number2.default;
	} else if (type === Boolean) {
		return _boolean2.default;
	} else if (type === Date) {
		return _date2.default;
	}

	throw new Error('Unrecognized type');
};

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _string = require('./string');

var _string2 = _interopRequireDefault(_string);

var _number = require('./number');

var _number2 = _interopRequireDefault(_number);

var _boolean = require('./boolean');

var _boolean2 = _interopRequireDefault(_boolean);

var _date = require('./date');

var _date2 = _interopRequireDefault(_date);

var _object = require('./object');

var _object2 = _interopRequireDefault(_object);

var _array = require('./array');

var _array2 = _interopRequireDefault(_array);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }