'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _orientjs = require('orientjs');

var _orientjs2 = _interopRequireDefault(_orientjs);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _constantsReadystate = require('./constants/readystate');

var _constantsReadystate2 = _interopRequireDefault(_constantsReadystate);

var _schemasOrientV = require('./schemas/orient/v');

var _schemasOrientV2 = _interopRequireDefault(_schemasOrientV);

var _schemasOrientE = require('./schemas/orient/e');

var _schemasOrientE2 = _interopRequireDefault(_schemasOrientE);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var Connection = (function (_EventEmitter) {
	_inherits(Connection, _EventEmitter);

	function Connection(options, dbOptions) {
		var _this = this;

		_classCallCheck(this, Connection);

		_get(Object.getPrototypeOf(Connection.prototype), 'constructor', this).call(this);
		options = options || {};
		dbOptions = dbOptions || {};

		if (typeof dbOptions === 'string') {
			var dbName = dbOptions;
			dbOptions = {
				name: dbName
			};
		}

		this._options = options;
		this._dbOptions = dbOptions;

		this._models = {};

		this._server = (0, _orientjs2['default'])(options);
		this._db = this._server.use(dbOptions);
		this._status = null;
		this._readyState = _constantsReadystate2['default'].DISCONNECTED;

		this.db.open().then(function (status) {
			_this._status = status;
			_this._readyState = _constantsReadystate2['default'].CONNECTED;
		}, function (err) {
			_this._readyState = _constantsReadystate2['default'].DISCONNECTED;
		});

		this._registerBasicModels();
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
				return _bluebird2['default'].reject(new Error('Model already exists'));
			}
			var self = this;
			return new _bluebird2['default'](function (resolve, reject) {
				self._models[name] = new _model2['default'](name, schema, self, options, function (err, model) {
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
			this.model('V', new _schemasOrientV2['default'](), { ensure: false });
			this.model('E', new _schemasOrientE2['default'](), { ensure: false });
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
			return _orientjs2['default'];
		}
	}, {
		key: 'readyState',
		get: function get() {
			return this._readyState;
		}
	}]);

	return Connection;
})(_events.EventEmitter);

exports['default'] = Connection;
module.exports = exports['default'];