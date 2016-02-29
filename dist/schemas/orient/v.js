'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _vertex = require('../vertex');

var _vertex2 = _interopRequireDefault(_vertex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var V = function (_VertexSchema) {
	_inherits(V, _VertexSchema);

	function V(props, options) {
		_classCallCheck(this, V);

		options = options || {};
		options.extend = options.extend || 'V';

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(V).call(this, props, options));

		var self = _this;
		(0, _index.prepareSchema)(_this);
		return _this;
	}

	return V;
}(_vertex2.default);

exports.default = V;