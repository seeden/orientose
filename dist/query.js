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

var RecordID = require("oriento").RecordID;

var LogicOperators = _interopRequire(require("./constants/logicoperators"));

var ComparisonOperators = _interopRequire(require("./constants/comparisonoperators"));

var extend = _interopRequire(require("node.extend"));

var Promise = _interopRequire(require("bluebird"));

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

var rRIDLike = /^[\d]+:[\d]+$/;

var Query = (function () {
	function Query(model, options) {
		_classCallCheck(this, Query);

		options = options || {};

		if (!model) {
			throw new Error("Model is not defined");
		}

		this._paramIndex = 1;

		this._model = model;
		this._target = model.name;

		this._first = false;
		this._scalar = false;
		this._raw = false;

		this._limit = null;
		this._skip = null;
		this._sort = null;

		this._from = null;
		this._to = null;
		this._let = {};

		this._selects = [];

		this._operation = null;

		this._params = {};

		this._operators = [];
		this._set = null;
		var self = this;
		for (var name in this._model._documentClass) {
			this[name] = (function (name) {
				return function () {
					return self._model._documentClass[name].apply(self, arguments);
				};
			})(name);
		}
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
		count: {
			value: function count(key) {
				return this.select("count(" + key + ")");
			}
		},
		select: {
			value: function select(key) {
				this._selects.push(key);
				return this;
			}
		},
		paramify: {
			value: function paramify(key) {
				return key.replace(/([^A-Za-z0-9])/g, "");
			}
		},
		nextParamName: {
			value: function nextParamName(propertyName) {
				return this.paramify(propertyName) + "_op_" + this._paramIndex++;
			}
		},
		addParam: {
			value: function addParam(paramName, value) {
				this._params[paramName] = value;
			}
		},
		addParams: {
			value: function addParams(params) {
				params = params || {};
				extend(this._params, params);
			}
		},
		createComparisonQuery: {
			value: function createComparisonQuery(propertyName, operator, value) {
				var param;
				if (true === value.__orientose_raw__) {
					param = value;
				} else if (Array.isArray(value)) {
					param = [];
					for (var i = 0; i < value.length; i++) {
						var paramName = this.nextParamName(propertyName);
						param[i] = ":" + paramName;
						this.addParam(paramName, value[i]);
					}
				} else {
					var paramName = this.nextParamName(propertyName);
					param = ":" + paramName;
					this.addParam(paramName, value);
				}
				if (value === null) {
					if (operator === "=") {
						return propertyName + " IS NULL";
					} else if (operator === "!=" || operator === "<>" || operator === "NOT") {
						return propertyName + " IS NOT NULL";
					}
				}

				if (Array.isArray(value)) {
					var op = operator.toLowerCase();
					if ("between" === op) {
						return propertyName + " BETWEEN " + param.join(" AND ");
					} else if ("in" === op) {
						return propertyName + " IN (" + param.join(", ") + ") ";
					}
				}

				return propertyName + " " + operator + " " + param;
			}
		},
		queryLanguage: {
			value: function queryLanguage(conditions) {
				var _this = this;

				var items = [];

				Object.keys(conditions).forEach(function (propertyName) {

					if (propertyName === "_id") {
						propertyName = "@rid";
					}

					var value = conditions[propertyName];
					if (typeof value === "undefined") {
						return;
					}

					// optimizations by converting rid so as to ensure indexes are used
					var type = _this.schema.getSchemaType(propertyName);

					if (type && "LINK" === type.getDbType() && !(value instanceof RecordID)) {
						// this should be converted and allowed to be pure RID
						if (typeof value === "string" && rRIDLike.test(value)) {
							value = "#" + value;
						}
						var oldvalue = new RecordID(value);
						if (oldvalue) {
							value = oldvalue;
						}
					}

					if (LogicOperators[propertyName]) {
						var subQueries = [];

						value.forEach(function (conditions) {
							var query = _this.queryLanguage(conditions);
							if (!query) {
								return;
							}

							subQueries.push(query);
						});

						if (!subQueries.length) {
							return;
						} else if (subQueries.length === 1) {
							return items.push(subQueries[0]);
						}

						var query = "(" + subQueries.join(") " + LogicOperators[propertyName] + " (") + ")";
						return items.push(query);
					}

					// if(value instanceof RecordID) {
					// value = value.toString();
					// }

					if (!_.isObject(value) || value instanceof RecordID) {
						var query = _this.createComparisonQuery(propertyName, "=", value);
						return items.push(query);
					}

					Object.keys(value).forEach(function (operation) {
						var operationValue = value[operation];
						// if(value instanceof RecordID) {
						// value = value.toString();
						// }

						var query = null;
						if (ComparisonOperators[operation]) {
							query = _this.createComparisonQuery(propertyName, ComparisonOperators[operation], operationValue);
						}

						if (!query) {
							return;
						}

						items.push(query);
					});
				});

				if (!items.length) {
					return null;
				}

				return items.join(" AND ");
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
				var query = this.queryLanguage(conditions);

				if (!query) {
					return this;
				}

				this._operators.push({
					type: operator,
					query: query
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
					} else if (conditions instanceof RecordID) {
						this._target = conditions;
						conditions = void 0;
					} else {
						this.where(conditions);
					}
				}
				return this; // making exec implicit
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
			value: function and(conditions) {
				var self = this;
				conditions.forEach(function (condition) {
					self = self.operator(Operator.AND, condition);
				});
				return self;
			}
		},
		"let": {
			value: function _let(name, statement) {
				this._let[name] = statement;
				return this;
			}
		},
		where: {
			value: function where(conditions, callback) {
				conditions = conditions || {};
				this.operator(Operator.WHERE, conditions);

				return this.condExec(callback);
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
		raw: {
			value: function raw() {
				this._raw = true;
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

			value: function update(conditions, doc, options) {
				if (typeof options === "function") {
					callback = options;
					options = {};
				}
				options = options || {};

				if (typeof conditions === "undefined" || typeof doc === "undefined") {
					throw new Error("One of parameters is missing");
				}

				return this.operation(Operation.UPDATE).limit(options.multi ? null : 1).set(doc).scalar(true).condExec(conditions, true);
			}
		},
		find: {

			//find([conditions], [callback])

			value: function find(conditions) {
				return this.operation(Operation.SELECT).condExec(conditions, true);
			}
		},
		findOne: {

			//findOne([criteria], [callback])

			value: function findOne(conditions) {
				return this.operation(Operation.SELECT).limit(1).first(true).condExec(conditions, true);
			}
		},
		remove: {

			//remove([conditions], [callback])

			value: function remove(conditions) {
				return this.operation(Operation.DELETE).scalar(true).condExec(conditions, true);
			}
		},
		transaction: {
			value: (function (_transaction) {
				var _transactionWrapper = function transaction(_x8) {
					return _transaction.apply(this, arguments);
				};

				_transactionWrapper.toString = function () {
					return _transaction.toString();
				};

				return _transactionWrapper;
			})(function (transaction) {
				this._transaction = transaction;
				return this;
			})
		},
		then: {
			value: function then(fn) {
				return this.exec(fn);
			}
		},
		map: {
			value: function map(fn) {
				return this.exec().map(fn);
			}
		},
		exec: {
			value: function exec(fn) {
				var _this = this;

				var model = this.model;
				var schema = model.schema;
				var operation = this._operation;
				if (!operation) {
					this.operation(Operation.SELECT);
					operation = this._operation;
					// lets default this as select unless otherwise
					// return Promise.reject(new Error('Operation is not defined'));
				}

				var query;
				if (this._transaction) {
					query = this._transaction;
				} else {
					query = new OrientoQuery(model.connection.db);
				}
				var q = query;

				var target = this._target && this._target["@rid"] ? this._target["@rid"] : this._target;
				console.log("AT LEAST WE REACHED HERE?!?!?");

				var isGraph = schema instanceof GraphSchema;
				var selects;
				if (this._selects.length > 0) {
					selects = this._selects.join(",");
				}
				if (isGraph) {
					var graphType = schema instanceof EdgeSchema ? "EDGE" : "VERTEX";

					if (operation === Operation.INSERT) {
						query = query.create(graphType, target);
					} else if (operation === Operation.DELETE) {
						query = query["delete"](graphType, target);
					} else if (operation === Operation.SELECT) {
						query = query.select(selects).from(target);
					} else {
						query = query.update(target);
					}
				} else {
					if (operation === Operation.INSERT) {
						query = query.insert().into(target);
					} else if (operation === Operation.DELETE) {
						query = query["delete"]().from(target);
					} else if (operation === Operation.SELECT) {
						query = query.select(selects).from(target);
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
					query = query[operator.type](operator.query);
				});

				for (var name in this._let) {
					query = query["let"](name, this._let[name]);
				}

				query.addParams(this._params);

				if (!this._scalar && !this._raw && (operation === Operation.SELECT || operation === Operation.INSERT)) {
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

				var promise = query.exec().then(function (results) {
					if (!results) {
						return Promise.resolve(results);
					}

					if (_this._first) {
						results = results[0];
					}

					if (_this._scalar && results.length) {
						results = parseInt(results[0]);
					}
					return Promise.resolve(results);
				});
				if (fn) {
					return promise.then(fn);
				}
				return promise;
			}
		}
	});

	return Query;
})();

module.exports = Query;