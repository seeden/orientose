'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var Document = (function (_EventEmitter) {
	_inherits(Document, _EventEmitter);

	function Document(model, properties, options) {
		_classCallCheck(this, Document);

		_get(Object.getPrototypeOf(Document.prototype), 'constructor', this).call(this);
		properties = properties || {};

		this._model = model;
		this._data = new model.schema.DataClass(properties, model.name);

		this._from = null;
		this._to = null;

		this._isNew = true;
	}

	_createClass(Document, [{
		key: 'from',
		value: function from(value) {
			this._from = value;
			return this;
		}
	}, {
		key: 'to',
		value: function to(value) {
			this._to = value;
			return this;
		}
	}, {
		key: 'model',
		value: function model(name) {
			return this._model.model(name);
		}
	}, {
		key: 'get',
		value: function get(path) {
			return this._data.get(path);
		}
	}, {
		key: 'set',
		value: function set(path, value) {
			this._data.set(path, value);
			return this;
		}
	}, {
		key: 'transaction',
		value: function transaction(s) {
			this._transaction = s;
			return this;
		}
	}, {
		key: 'isModified',
		value: function isModified(path) {
			return this._data.isModified(path);
		}
	}, {
		key: 'setupData',
		value: function setupData(properties) {
			this._data.setupData(properties);
			this._isNew = false;
			if (require('util').isFunction(this.afterLoad)) {
				this.afterLoad();
			}
			return this;
		}
	}, {
		key: 'toJSON',
		value: function toJSON(options) {
			return this._data.toJSON(options);
		}
	}, {
		key: 'toObject',
		value: function toObject(options) {
			return this._data.toObject(options);
		}
	}, {
		key: 'save',
		value: function save(callback) {
			var hooks = this._model.schema.hooks;
			var self = this;
			return new Promise(function (resolve, reject) {
				hooks.execPre('validate', self, function (error) {
					if (error) {
						return reject(error);
					}

					hooks.execPre('save', self, function (error) {
						if (error) {
							return reject(error);
						}

						var properties = self.toObject({
							virtuals: false,
							metadata: false,
							modified: true,
							query: false //change by yecn at 2015-08-31 15:29
						});

						var model = self._model;
						if (self._transaction) {
							model.transaction(self._transaction);
						}
						if (self.isNew) {
							return model.create(properties).from(self._from).to(self._to).exec().then(function (user) {
								self.setupData(user.toJSON({
									virtuals: false
								}));

								return resolve(self);
							})['catch'](reject);
						}

						return model.update(self, properties).exec().then(function (total) {

							self.setupData(properties);
							return resolve(self);
						})['catch'](reject);
					});
				});
			});
		}
	}, {
		key: 'remove',
		value: function remove() {
			var model = this._model;
			var hooks = model.schema.hooks;
			var self = this;

			if (this.isNew) {
				return Promise.resolve(this);
			}
			return new Promise(function (resolve, reject) {
				hooks.execPre('remove', self, function (error) {
					if (error) {
						return reject(error);
					}

					model.remove(self, true).then(function (result) {
						resolve(result);
					})['catch'](reject);
				});
			});
		}
	}, {
		key: 'isNew',
		get: function get() {
			return this._isNew;
		}
	}], [{
		key: 'let',
		value: function _let(name, statement) {
			return this._model['let'](name, statement);
		}
	}, {
		key: 'exec',
		value: function exec() {
			return this._model.exec();
		}
	}, {
		key: 'where',
		value: function where(conditions) {
			return this._model.where(conditions);
		}
	}, {
		key: 'findById',
		value: function findById(id, callback) {
			return this.findOne(id, callback);
		}
	}, {
		key: 'findOne',
		value: function findOne(conditions, callback) {
			return this._model.findOne(conditions, callback);
		}
	}, {
		key: 'count',
		value: function count(key) {
			return this._model.count(key);
		}
	}, {
		key: 'find',
		value: function find(conditions, callback) {
			return this._model.find(conditions, callback);
		}
	}, {
		key: 'create',
		value: function create(properties, callback) {
			return new this(properties).save(callback);
		}
	}, {
		key: 'update',
		value: function update(conditions, doc, options, callback) {
			return this._model.update(conditions, doc, options, callback);
		}
	}, {
		key: 'remove',
		value: function remove(conditions, callback) {
			return this._model.remove(conditions, callback);
		}
	}, {
		key: 'createClass',
		value: function createClass(_model) {
			var DocumentModel = (function (_Document) {
				_inherits(DocumentModel, _Document);

				function DocumentModel(properties) {
					_classCallCheck(this, DocumentModel);

					_get(Object.getPrototypeOf(DocumentModel.prototype), 'constructor', this).call(this, _model, properties);
				}

				_createClass(DocumentModel, null, [{
					key: 'model',
					value: function model(modelName) {
						return _model.model(modelName);
					}
				}, {
					key: '_model',
					get: function get() {
						return _model;
					}
				}, {
					key: 'modelName',
					get: function get() {
						return _model.name;
					}
				}]);

				return DocumentModel;
			})(Document);

			;

			var schema = _model.schema;

			//add basic data getters and setters
			schema.traverse(function (fieldName, fieldOptions) {
				Object.defineProperty(DocumentModel.prototype, fieldName, {
					enumerable: true,
					configurable: true,
					get: function get() {
						return this.get(fieldName);
					},
					set: function set(value) {
						this.set(fieldName, value);
						return this;
					}
				});
			});

			//add methods
			for (var methodName in schema.methods) {
				var fn = schema.methods[methodName];
				DocumentModel.prototype[methodName] = fn;
			}

			//add statics
			for (var staticName in schema.statics) {
				var fn = schema.statics[staticName];
				DocumentModel[staticName] = fn;
			}

			return DocumentModel;
		}
	}]);

	return Document;
})(_events.EventEmitter);

exports['default'] = Document;
module.exports = exports['default'];