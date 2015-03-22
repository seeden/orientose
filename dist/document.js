"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var EventEmitter = require("events").EventEmitter;

var Document = (function (_EventEmitter) {
	function Document(model, properties, options) {
		_classCallCheck(this, Document);

		properties = properties || {};

		this._model = model;
		this._data = new model.schema.DataClass(properties);

		this._from = null;
		this._to = null;

		this._isNew = true;
	}

	_inherits(Document, _EventEmitter);

	_createClass(Document, {
		from: {
			value: function from(value) {
				this._from = value;
				return this;
			}
		},
		to: {
			value: function to(value) {
				this._to = value;
				return this;
			}
		},
		model: {
			value: function model(name) {
				return this._model.model(name);
			}
		},
		get: {
			value: function get(path) {
				return this._data.get(path);
			}
		},
		set: {
			value: function set(path, value) {
				this._data.set(path, value);
				return this;
			}
		},
		isNew: {
			get: function () {
				return this._isNew;
			}
		},
		isModified: {
			value: function isModified(path) {
				return this._data.isModified(path);
			}
		},
		setupData: {
			value: function setupData(properties) {
				this._data.setupData(properties);
				this._isNew = false;
				return this;
			}
		},
		toJSON: {
			value: function toJSON(options) {
				return this._data.toJSON(options);
			}
		},
		save: {
			value: function save(callback) {
				var _this = this;

				var hooks = this._model.schema.hooks;
				hooks.execPre("validate", this, function (error) {
					if (error) {
						return callback(error);
					}

					hooks.execPre("save", _this, function (error) {
						if (error) {
							return callback(error);
						}

						var properties = _this.toJSON({
							virtuals: false,
							metadata: false,
							modified: true
						});

						if (_this.isNew) {
							_this._model.create(properties).from(_this._from).to(_this._to).exec(function (error, user) {
								if (error) {
									return callback(error);
								}

								_this.setupData(user.toJSON({
									virtuals: false
								}));

								callback(null, _this);
							});

							return;
						}

						_this._model.update(_this, properties, function (err, total) {
							if (err) {
								return callback(err);
							}

							_this.setupData(properties);
							callback(null, _this);
						});
					});
				});
			}
		},
		remove: {
			value: function remove(callback) {
				var _this = this;

				var model = this._model;
				var hooks = model.schema.hooks;

				if (this.isNew) {
					return callback(null, this);
				}

				hooks.execPre("remove", this, function (error) {
					if (error) {
						return callback(error);
					}

					model.remove(_this, callback);
				});
			}
		}
	}, {
		findById: {
			value: function findById(id, callback) {
				this.findOne(id, callback);
			}
		},
		findOne: {
			value: function findOne(conditions, callback) {
				return this.model.findOne(conditions, callback);
			}
		},
		find: {
			value: function find(conditions, callback) {
				return this.model.find(conditions, callback);
			}
		},
		create: {
			value: function create(properties, callback) {
				return new this(properties).save(callback);
			}
		},
		remove: {
			value: function remove(conditions, callback) {
				return this.model.remove(conditions, callback);
			}
		},
		model: {
			get: function () {
				throw new Error("You need to override model getter");
			}
		},
		createClass: {
			value: function createClass(model) {
				var DocumentModel = (function (_Document) {
					function DocumentModel(properties) {
						_classCallCheck(this, DocumentModel);

						_get(Object.getPrototypeOf(DocumentModel.prototype), "constructor", this).call(this, model, properties);
					}

					_inherits(DocumentModel, _Document);

					_createClass(DocumentModel, null, {
						model: {
							get: function () {
								return model;
							}
						},
						modelName: {
							get: function () {
								return model.name;
							}
						}
					});

					return DocumentModel;
				})(Document);

				;

				var schema = model.schema;

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
		}
	});

	return Document;
})(EventEmitter);

module.exports = Document;