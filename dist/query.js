"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var OrientoQuery = _interopRequire(require("oriento/lib/db/query"));

var debug = _interopRequire(require("debug"));

var log = debug("orientose:query");

var Action = {
	DELETE: "delete",
	UPDATE: "update",
	SELECT: "select",
	CREATE: "insert"
};

var Operation = {
	OR: "or",
	AND: "and",
	WHERE: "where",
	SET: "set"
};

var Query = (function () {
	function Query(model, options) {
		_classCallCheck(this, Query);

		options = options || {};

		if (!model) {
			throw new Error("Model is not defined");
		}

		this._model = model;

		this._one = false;
		this._scalar = false;
		this._limit = null;
		this._action = null;
		this._params = [];
		this._set = null;
	}

	_createClass(Query, {
		model: {
			get: function () {
				return this._model;
			}
		},
		exec: {
			value: function exec(callback) {
				callback = callback || function () {};

				var model = this.model;

				var action = this._action;
				if (!action) {
					throw new Error("Action is not defined");
				}

				var query = new OrientoQuery(model.connection.db);
				var q = query;

				query = query[action]();
				query = action === Action.CREATE ? query.into(model.name) : from(model.name);

				this._params.forEach(function (params) {
					query = query[params.operation](params.conditions);
				});

				if (action === Action.SELECT) {
					query = query.transform(function (record) {
						return model._createDocument(record);
					});
				}

				if (this._limit) {
					query = query.limit(this._limit);
				}

				if (this._one) {
					query = query.one();
				}

				if (this._scalar) {
					query = query.scalar();
				}

				log(q.buildStatement(), q.buildOptions());

				return query.then(function (results) {
					callback(null, results);
				}, callback);
			}
		},
		operation: {
			value: (function (_operation) {
				var _operationWrapper = function operation(_x, _x2, _x3) {
					return _operation.apply(this, arguments);
				};

				_operationWrapper.toString = function () {
					return _operation.toString();
				};

				return _operationWrapper;
			})(function (operation, cond, callback) {
				this._params.push({
					operation: operation,
					conditions: cond
				});

				return this;
			})
		},
		where: {
			value: function where(cond, callback) {
				var _this = this;

				if (cond.$or) {
					cond.$or.forEach(function (cond) {
						_this.operation(Operation.OR, cond);
					});
				} else if (cond.$and) {
					cond.$and.forEach(function (cond) {
						_this.operation(Operation.AND, cond);
					});
				} else {
					this.operation(Operation.WHERE, cond);
				}

				return this.condExec(callback);
			}
		},
		condExec: {
			value: function condExec(cond, callback) {
				if (typeof cond === "function") {
					callback = cond;
					cond = void 0;
				}

				if (cond) {
					this.where(cond);
				}

				return callback ? this.exec(callback) : this;
			}
		},
		remove: {
			value: function remove(cond, callback) {
				this._action = Action.DELETE;

				this._scalar = true;
				this._one = true;
				this._limit = 1;

				return this.condExec(cond, callback);
			}
		},
		find: {
			value: function find(cond, callback) {
				this._action = Action.SELECT;

				return this.condExec(cond, callback);
			}
		},
		findOne: {
			value: function findOne(cond, callback) {
				this._one = true;
				this._limit = 1;

				return this.find(cond, callback);
			}
		},
		update: {
			value: function update(criteria, options, callback) {
				this._action = Action.UPDATE;

				this._one = true;
				this._limit = 1;

				return this.condExec(criteria, callback);
			}
		},
		create: {
			value: function create(doc, callback) {
				this._action = Action.CREATE;

				this._one = true;

				this.operation(Operation.SET, doc);
				return this.condExec(callback);
			}
		}
	});

	return Query;
})();

module.exports = Query;