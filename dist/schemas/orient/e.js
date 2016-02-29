'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _edge = require('../edge');

var _edge2 = _interopRequireDefault(_edge);

var _rid = require('../../types/rid');

var _rid2 = _interopRequireDefault(_rid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BASE_EDGE_CLASS = 'E';

var E = function (_EdgeSchema) {
	_inherits(E, _EdgeSchema);

	function E(props, options) {
		_classCallCheck(this, E);

		options = options || {};
		options.extend = options.extend || BASE_EDGE_CLASS;

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(E).call(this, props, options));

		(0, _index.prepareSchema)(_this);

		//add default properties
		_this.add({
			'in': { type: _rid2.default, required: true, notNull: true }, //from
			'out': { type: _rid2.default, required: true, notNull: true } //to
		});

		if (options.unique) {
			_this.index({
				'in': 1,
				'out': 1
			}, { unique: true });
		}
		return _this;
	}

	return E;
}(_edge2.default);

exports.default = E;