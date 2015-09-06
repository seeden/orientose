'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _edge = require('../edge');

var _edge2 = _interopRequireDefault(_edge);

var _typesRid = require('../../types/rid');

var _typesRid2 = _interopRequireDefault(_typesRid);

var BASE_EDGE_CLASS = 'E';

var E = (function (_EdgeSchema) {
	_inherits(E, _EdgeSchema);

	function E(props, options) {
		_classCallCheck(this, E);

		options = options || {};
		options.extend = options.extend || BASE_EDGE_CLASS;

		_get(Object.getPrototypeOf(E.prototype), 'constructor', this).call(this, props, options);

		(0, _index.prepareSchema)(this);

		//add default properties
		this.add({
			'in': { type: _typesRid2['default'], required: true, notNull: true }, //from
			'out': { type: _typesRid2['default'], required: true, notNull: true } //to
		});

		if (options.unique) {
			this.index({
				'in': 1,
				'out': 1
			}, { unique: true });
		}
	}

	return E;
})(_edge2['default']);

exports['default'] = E;
module.exports = exports['default'];