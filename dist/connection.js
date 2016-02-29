'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _orientjs = require('orientjs');

var _orientjs2 = _interopRequireDefault(_orientjs);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _readystate = require('./constants/readystate');

var _readystate2 = _interopRequireDefault(_readystate);

var _v = require('./schemas/orient/v');

var _v2 = _interopRequireDefault(_v);

var _e = require('./schemas/orient/e');

var _e2 = _interopRequireDefault(_e);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Connection = function (_EventEmitter) {
	_inherits(Connection, _EventEmitter);

	function Connection(options, dbOptions) {
		_classCallCheck(this, Connection);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Connection).call(this));

		options = options || {};
		dbOptions = dbOptions || {};

		if (typeof dbOptions === 'string') {
			var dbName = dbOptions;
			dbOptions = {
				name: dbName
			};
		}

		_this._options = options;
		_this._dbOptions = dbOptions;

		_this._models = {};

		_this._server = (0, _orientjs2.default)(options);
		_this._db = _this._server.use(dbOptions);
		_this._status = null;
		_this._readyState = _readystate2.default.DISCONNECTED;

		_this.db.open().then(function (status) {
			_this._status = status;
			_this._readyState = _readystate2.default.CONNECTED;
		}, function (err) {
			_this._readyState = _readystate2.default.DISCONNECTED;
		});

		_this._registerBasicModels();
		return _this;
	}

	_createClass(Connection, [{
		key: 'model',
		value: function model(name, schema, options) {

			options = options || {};

			if (typeof schema === 'undefined') {
				if (!this._models[name]) {
					throw new Error('Model does not exists');
				}
				return this._models[name].DocumentClass;
			}

			if (this._models[name]) {
				return _bluebird2.default.reject(new Error('Model already exists'));
			}
			var self = this;
			return new _bluebird2.default(function (resolve, reject) {
				self._models[name] = new _model2.default(name, schema, self, options, function (err, model) {
					if (err) {
						return reject(err);
					}
					resolve(model.DocumentClass);
				});
			});
		}

		/*
  Returns an array of model names created on this connection.
  */

	}, {
		key: 'modelNames',
		value: function modelNames() {
			return Object.keys(this._models);
		}
	}, {
		key: '_registerBasicModels',
		value: function _registerBasicModels() {
			this.model('V', new _v2.default(), { ensure: false });
			this.model('E', new _e2.default(), { ensure: false });
		}
	}, {
		key: 'db',
		get: function get() {
			return this._db;
		}
	}, {
		key: 'server',
		get: function get() {
			return this._server;
		}
	}, {
		key: 'Oriento',
		get: function get() {
			return _orientjs2.default;
		}
	}, {
		key: 'readyState',
		get: function get() {
			return this._readyState;
		}
	}]);

	return Connection;
}(_events.EventEmitter);

exports.default = Connection;