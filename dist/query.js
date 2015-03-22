"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var OrientoQuery = _interopRequire(require("oriento/lib/db/query"));

var debug = _interopRequire(require("debug"));

var _ = _interopRequire(require("lodash"));

var Document = _interopRequire(require("./document"));

var GraphSchema = _interopRequire(require("./schemas/graph"));

var EdgeSchema = _interopRequire(require("./schemas/edge"));

var log = debug("orientose:query");

var Operation = {
	DELETE: "DELETE",
	UPDATE: "UPDATE",
	SELECT: "SELECT",
	INSERT: "INSERT"
};

var Operator = {
	OR: "or",
	AND: "and",
	WHERE: "where"
};

var Query = (function () {
	function Query(model, options) {
		_classCallCheck(this, Query);

		options = options || {};

		if (!model) {
			throw new Error("Model is not defined");
		}

		this._model = model;
		this._target = model.name;

		this._first = false;
		this._scalar = false;

		this._limit = null;
		this._skip = null;
		this._sort = null;

		this._from = null;
		this._to = null;

		this._operation = null;

		this._operators = [];
		this._set = null;
	}

	_createClass(Query, {
		model: {
			get: function () {
				return this._model;
			}
		},
		schema: {
			get: function () {
				return this.model.schema;
			}
		},
		operator: {
			value: (function (_operator) {
				var _operatorWrapper = function operator(_x, _x2, _x3) {
					return _operator.apply(this, arguments);
				};

				_operatorWrapper.toString = function () {
					return _operator.toString();
				};

				return _operatorWrapper;
			})(function (operator, conditions, callback) {
				this._operators.push({
					type: operator,
					conditions: conditions
				});

				return this;
			})
		},
		condExec: {
			value: function condExec(conditions, callback) {
				if (typeof conditions === "function") {
					callback = conditions;
					conditions = void 0;
				}

				if (typeof conditions === "string") {
					this._target = conditions;
					conditions = void 0;
				}

				if (_.isObject(conditions)) {
					if (conditions instanceof Document) {
						this._target = conditions;
						conditions = void 0;
					} else {
						this.where(conditions);
					}
				}

				return callback ? this.exec(callback) : this;
			}
		},
		or: {
			value: function or(conditions) {
				var self = this;
				conditions.forEach(function (condition) {
					self = self.operator(Operator.OR, condition);
				});
				return self;
			}
		},
		and: {
			value: function and(expressions) {
				var self = this;
				conditions.forEach(function (condition) {
					self = self.operator(Operator.AND, condition);
				});
				return self;
			}
		},
		where: {
			value: function where(conditions, callback) {
				var self = this;
				if (conditions.$or) {
					self = self.or(conditions.$or);
				} else if (conditions.$and) {
					self = self.or(conditions.$and);
				} else {
					self = self.operator(Operator.WHERE, conditions);
				}

				return self.condExec(callback);
			}
		},
		operation: {
			value: (function (_operation) {
				var _operationWrapper = function operation(_x4) {
					return _operation.apply(this, arguments);
				};

				_operationWrapper.toString = function () {
					return _operation.toString();
				};

				return _operationWrapper;
			})(function (operation) {
				if (this._operation && this._operation !== operation) {
					throw new Error("Operation is already set");
				}
				this._operation = operation;
				return this;
			})
		},
		set: {
			value: function set(doc) {
				this._set = doc;
				return this;
			}
		},
		first: {
			value: function first(useFirst) {
				this._first = !!useFirst;
				return this;
			}
		},
		scalar: {
			value: function scalar(useScalar) {
				this._scalar = !!useScalar;
				return this;
			}
		},
		limit: {
			value: (function (_limit) {
				var _limitWrapper = function limit(_x5) {
					return _limit.apply(this, arguments);
				};

				_limitWrapper.toString = function () {
					return _limit.toString();
				};

				return _limitWrapper;
			})(function (limit) {
				this._limit = limit;
				return this;
			})
		},
		skip: {
			value: (function (_skip) {
				var _skipWrapper = function skip(_x6) {
					return _skip.apply(this, arguments);
				};

				_skipWrapper.toString = function () {
					return _skip.toString();
				};

				return _skipWrapper;
			})(function (skip) {
				this._skip = skip;
				return this;
			})
		},
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
		sort: {
			value: (function (_sort) {
				var _sortWrapper = function sort(_x7) {
					return _sort.apply(this, arguments);
				};

				_sortWrapper.toString = function () {
					return _sort.toString();
				};

				return _sortWrapper;
			})(function (sort) {
				if (typeof sort === "string") {
					var order = {};

					var parts = sort.split(" ");
					parts.forEach(function (part) {
						var direction = 1;
						if (part[0] === "-") {
							part = part.substr(1);
							direction = -1;
						}

						order[part] = direction;
					});

					sort = order;
				}

				this._sort = sort;
				return this;
			})
		},
		create: {
			/**
   update(doc, [callback])
   */

			value: function create(doc, callback) {
				if (typeof doc === "function") {
					callback = doc;
					doc = {};
				}

				return this.operation(Operation.INSERT).set(doc).first(true).condExec(callback);
			}
		},
		update: {

			/**
   update(conditions, update, [options], [callback])
   */

			value: function update(conditions, doc, options, callback) {
				if (typeof options === "function") {
					callback = options;
					options = {};
				}

				if (typeof conditions === "undefined" || typeof doc === "undefined") {
					throw new Error("One of parameters is missing");
				}

				return this.operation(Operation.UPDATE).limit(options.multi ? null : 1).set(doc).scalar(true).condExec(conditions, callback);
			}
		},
		find: {

			//find([conditions], [callback])

			value: function find(conditions, callback) {
				return this.operation(Operation.SELECT).condExec(conditions, callback);
			}
		},
		findOne: {

			//findOne([criteria], [callback])

			value: function findOne(conditions, callback) {
				return this.operation(Operation.SELECT).limit(1).first(true).condExec(conditions, callback);
			}
		},
		remove: {

			//remove([conditions], [callback])

			value: function remove(conditions, callback) {
				return this.operation(Operation.DELETE).scalar(true).condExec(conditions, callback);
			}
		},
		exec: {
			value: function exec(callback) {
				var _this = this;

				callback = callback || function () {};

				var model = this.model;
				var schema = model.schema;
				var operation = this._operation;
				if (!operation) {
					throw new Error("Operation is not defined");
				}

				var query = new OrientoQuery(model.connection.db);
				var q = query;

				var target = this._target && this._target["@rid"] ? this._target["@rid"] : this._target;

				var isGraph = schema instanceof GraphSchema;
				if (isGraph) {
					var graphType = schema instanceof EdgeSchema ? "EDGE" : "VERTEX";

					if (operation === Operation.INSERT) {
						query = query.create(graphType, target);
					} else if (operation === Operation.DELETE) {
						query = query["delete"](graphType, target);
					} else if (operation === Operation.SELECT) {
						query = query.select().from(target);
					} else {
						query = query.update(target);
					}
				} else {
					if (operation === Operation.INSERT) {
						query = query.insert().into(target);
					} else if (operation === Operation.DELETE) {
						query = query["delete"]().from(target);
					} else if (operation === Operation.SELECT) {
						query = query.select().from(target);
					} else {
						query = query.update(target);
					}
				}

				if (this._from) {
					query.from(this._from && this._from["@rid"] ? this._from["@rid"] : this._from);
				}

				if (this._to) {
					query.to(this._to && this._to["@rid"] ? this._to["@rid"] : this._to);
				}

				if (this._set) {
					query.set(this._set);
				}

				this._operators.forEach(function (operator) {
					query = query[operator.type](operator.conditions);
				});

				if (!this._scalar && (operation === Operation.SELECT || operation === Operation.INSERT)) {
					query = query.transform(function (record) {
						return model._createDocument(record);
					});
				}

				if (this._limit) {
					query = query.limit(this._limit);
				}

				if (this._skip) {
					query = query.skip(this._skip);
				}

				if (this._sort) {
					var order = {};

					Object.keys(this._sort).forEach(function (key) {
						var value = _this._sort[key];
						order[key] = value === "asc" || value === "ascending" || value === 1 ? "ASC" : "DESC";
					});

					query = query.order(order);
				}

				log(q.buildStatement(), q.buildOptions());

				return query.exec().then(function (results) {
					if (!results) {
						return callback(null, results);
					}

					if (_this._first) {
						results = results[0];
					}

					if (_this._scalar && results.length) {
						results = parseInt(results[0]);
					}

					callback(null, results);
				}, callback);
			}
		}
	});

	return Query;
})();

module.exports = Query;