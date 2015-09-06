'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.prepareSchema = prepareSchema;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

var _typesRid = require('../../types/rid');

var _typesRid2 = _interopRequireDefault(_typesRid);

var _mongooseObjectid = require('../mongoose/objectid');

var _mongooseObjectid2 = _interopRequireDefault(_mongooseObjectid);

function getDefaultClassName() {
	return this._className;
}

function prepareSchema(schema) {
	schema.add({
		'@type': { type: String, readonly: true, metadata: true, query: true, 'default': 'document' },
		'@class': { type: String, readonly: true, metadata: true, query: true, 'default': getDefaultClassName },
		'@rid': { type: _typesRid2['default'], readonly: true, metadata: true },
		'version': { type: Number, readonly: true, metadata: true }
	});

	schema.virtual('rid', { metadata: true }).get(function () {
		return this.get('@rid');
	});

	var _id = schema.virtual('_id', { metadata: true });
	var version = schema.virtual('@version', { metadata: true });
	version.get(function () {
		return this.get('version');
	});

	_id.get(function () {
		return this.get('@rid');
	});
	_id.set(function (id) {
		return this.set('@rid');
	});
	var id = schema.virtual('id', { metadata: true });
	id.get(function () {
		return this.get('@rid').toString().substr(1);
	});
	id.set(function (id) {
		if (id[0] !== "#") {
			id = "#" + id;
		}
		return this.set('@rid', id);
	});
}

var OrientSchema = (function (_Schema) {
	_inherits(OrientSchema, _Schema);

	function OrientSchema(props, options) {
		_classCallCheck(this, OrientSchema);

		_get(Object.getPrototypeOf(OrientSchema.prototype), 'constructor', this).call(this, props, options);

		prepareSchema(this);
	}

	_createClass(OrientSchema, [{
		key: 'getSubdocumentSchemaConstructor',
		value: function getSubdocumentSchemaConstructor() {
			return OrientSchema;
		}
	}]);

	return OrientSchema;
})(_index2['default']);

exports['default'] = OrientSchema;