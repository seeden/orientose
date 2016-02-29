'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.prepareSchema = prepareSchema;

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

var _rid = require('../../types/rid');

var _rid2 = _interopRequireDefault(_rid);

var _objectid = require('../mongoose/objectid');

var _objectid2 = _interopRequireDefault(_objectid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getDefaultClassName() {
	return this._className;
}

function prepareSchema(schema) {
	schema.add({
		'@type': { type: String, readonly: true, metadata: true, query: true, default: 'document' },
		'@class': { type: String, readonly: true, metadata: true, query: true, default: getDefaultClassName },
		'@rid': { type: _rid2.default, readonly: true, metadata: true },
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

var OrientSchema = function (_Schema) {
	_inherits(OrientSchema, _Schema);

	function OrientSchema(props, options) {
		_classCallCheck(this, OrientSchema);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(OrientSchema).call(this, props, options));

		prepareSchema(_this);
		return _this;
	}

	_createClass(OrientSchema, [{
		key: 'getSubdocumentSchemaConstructor',
		value: function getSubdocumentSchemaConstructor() {
			return OrientSchema;
		}
	}]);

	return OrientSchema;
}(_index2.default);

exports.default = OrientSchema;