"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var EventEmitter = require("events").EventEmitter;

var Document = (function (EventEmitter) {
	function Document(model, properties, options) {
		_classCallCheck(this, Document);

		properties = properties || {};

		this._model = model;
		this._data = new model.schema.DataClass(properties);

		this._isNew = true;
	}

	_inherits(Document, EventEmitter);

	_prototypeProperties(Document, {
		findByRid: {
			value: function findByRid(rid, callback) {
				return this.model.findByRid(rid, callback);
			},
			writable: true,
			configurable: true
		},
		removeByRid: {
			value: function removeByRid(rid, callback) {
				return this.model.removeByRid(rid, callback);
			},
			writable: true,
			configurable: true
		},
		findOne: {
			value: function findOne(where, options, callback) {
				return this.model.findOne(where, options, callback);
			},
			writable: true,
			configurable: true
		},
		find: {
			value: function find(where, options, callback) {
				return this.model.find(where, options, callback);
			},
			writable: true,
			configurable: true
		},
		create: {
			value: function create(properties, callback) {
				return new this(properties).save(callback);
			},
			writable: true,
			configurable: true
		},
		model: {
			get: function () {
				throw new Error("You need to override model getter");
			},
			configurable: true
		},
		createClass: {
			value: function createClass(model) {
				var DocumentModel = (function (Document) {
					function DocumentModel(properties) {
						_classCallCheck(this, DocumentModel);

						_get(Object.getPrototypeOf(DocumentModel.prototype), "constructor", this).call(this, model, properties);
					}

					_inherits(DocumentModel, Document);

					_prototypeProperties(DocumentModel, {
						model: {
							get: function () {
								return model;
							},
							configurable: true
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
			},
			writable: true,
			configurable: true
		}
	}, {
		get: {
			value: function get(path) {
				return this._data.get(path);
			},
			writable: true,
			configurable: true
		},
		set: {
			value: function set(path, value) {
				this._data.set(path, value);
				return this;
			},
			writable: true,
			configurable: true
		},
		isNew: {
			get: function () {
				return this._isNew;
			},
			configurable: true
		},
		setupData: {
			value: function setupData(properties) {
				this._data.setupData(properties);
				this._isNew = false;
				return this;
			},
			writable: true,
			configurable: true
		},
		toJSON: {
			value: function toJSON(options) {
				return this._data.toJSON(options);
			},
			writable: true,
			configurable: true
		},
		save: {
			value: function save(callback) {
				var _this = this;

				var hooks = this._model.schema.hooks;
				hooks.execPre("save", this, function (error) {
					if (error) {
						return callback(error);
					}

					var properties = _this.toJSON({
						virtuals: false,
						metadata: false
					});

					if (_this.isNew) {
						_this._model.create(properties, function (error, user) {
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

					_this._model.updateByRid(_this.rid, properties, function (err, total) {
						if (err) {
							return callback(err);
						}

						_this.setupData(properties);
						callback(null, _this);
					});
				});
			},
			writable: true,
			configurable: true
		},
		remove: {
			value: function remove(callback) {
				var model = this._model;
				var hooks = model.schema.hooks;
				var rid = this.rid;

				if (this.isNew) {
					return callback(null, this);
				}

				hooks.execPre("remove", this, function (error) {
					if (error) {
						return callback(error);
					}

					if (model.isEdge) {
						return model.removeEdgeByRid(rid, callback);
					}

					if (model.isVertex) {
						return model.removeVertexByRid(rid, callback);
					}

					model.removeByRid(rid, callback);
				});
			},
			writable: true,
			configurable: true
		}
	});

	return Document;
})(EventEmitter);

module.exports = Document;