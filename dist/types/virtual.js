'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Virtual = function (_Type) {
	_inherits(Virtual, _Type);

	function Virtual() {
		_classCallCheck(this, Virtual);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(Virtual).apply(this, arguments));
	}

	_createClass(Virtual, [{
		key: '_preSerialize',
		value: function _preSerialize(value) {
			return this._serialize(value);
		}
	}, {
		key: '_preDeserialize',
		value: function _preDeserialize(value) {
			return this._deserialize(value);
		}
	}, {
		key: '_serialize',
		value: function _serialize(value) {
			this.applySet(this.mainData, value);
		}
	}, {
		key: '_deserialize',
		value: function _deserialize() {
			return this.applyGet(this.mainData);
		}
	}, {
		key: 'applyGet',
		value: function applyGet(scope) {
			if (!this.options.get) {
				throw new Error('Getter is not defined');
			}

			return this.options.get.call(scope, this);
		}
	}, {
		key: 'applySet',
		value: function applySet(scope, value) {
			if (!this.options.set) {
				return this;
			}

			this.options.set.call(scope, value, this);
			return this;
		}
	}, {
		key: 'isModified',
		get: function get() {
			return false;
		}
	}], [{
		key: 'toString',
		value: function toString() {
			return 'Virtual';
		}
	}]);

	return Virtual;
}(_type2.default);

exports.default = Virtual;