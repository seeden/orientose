'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _query = require('orientjs/lib/db/query');

var _query2 = _interopRequireDefault(_query);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _graph = require('./schemas/graph');

var _graph2 = _interopRequireDefault(_graph);

var _edge = require('./schemas/edge');

var _edge2 = _interopRequireDefault(_edge);

var _orientjs = require('orientjs');

var _logicoperators = require('./constants/logicoperators');

var _logicoperators2 = _interopRequireDefault(_logicoperators);

var _comparisonoperators = require('./constants/comparisonoperators');

var _comparisonoperators2 = _interopRequireDefault(_comparisonoperators);

var _node = require('node.extend');

var _node2 = _interopRequireDefault(_node);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = (0, _debug2.default)('orientose:query');

var Operation = {
	DELETE: 'DELETE',
	UPDATE: 'UPDATE',
	SELECT: 'SELECT',
	INSERT: 'INSERT'
};

var Operator = {
	OR: 'or',
	AND: 'and',
	WHERE: 'where'
};

var rRIDLike = /^[\d]+:[\d]+$/;

var Query = function () {
	function Query(model, options) {
		_classCallCheck(this, Query);

		options = options || {};

		if (!model) {
			throw new Error('Model is not defined');
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

		this._group = undefined;

		this._selects = [];

		this._operation = null;

		this._params = {};

		this._operators = [];
		this._set = null;
		var self = this;
		for (var name in this._model._documentClass) {
			this[name] = function (name) {
				return function () {
					return self._model._documentClass[name].apply(self, arguments);
				};
			}(name);
		}
	}

	_createClass(Query, [{
		key: 'count',
		value: function count(key) {
			return this.select('count(' + key + ')');
		}
	}, {
		key: 'select',
		value: function select(key) {
			this._selects.push(key);
			return this;
		}
	}, {
		key: 'paramify',
		value: function paramify(key) {
			return key.replace(/([^A-Za-z0-9])/g, '');
		}
	}, {
		key: 'nextParamName',
		value: function nextParamName(propertyName) {
			return this.paramify(propertyName) + '_op_' + this._paramIndex++;
		}
	}, {
		key: 'addParam',
		value: function addParam(paramName, value) {
			this._params[paramName] = value;
		}
	}, {
		key: 'addParams',
		value: function addParams(params) {
			params = params || {};
			(0, _node2.default)(this._params, params);
		}
	}, {
		key: 'createComparisonQuery',
		value: function createComparisonQuery(propertyName, operator, value) {
			var param;
			var type = this.schema.getSchemaType(propertyName);
			if (value && true === value.__orientose_raw__) {
				param = value;
			} else if (Array.isArray(value)) {
				param = [];
				for (var i = 0; i < value.length; i++) {
					var paramName = this.nextParamName(propertyName);
					param[i] = ":" + paramName;
					if ((type && "LINK" === type.getDbType() || "@rid" === propertyName) && !(param instanceof _orientjs.RecordID)) {
						value[i] = this.convertToRID(value[i]);
					}
					this.addParam(paramName, value[i]);
				}
			} else {
				var paramName = this.nextParamName(propertyName);
				param = ":" + paramName;
				if ((type && "LINK" === type.getDbType() || "@rid" === propertyName) && !(param instanceof _orientjs.RecordID)) {
					value = this.convertToRID(value);
				}
				this.addParam(paramName, value);
			}
			if (value === null) {
				if (operator === '=') {
					return propertyName + ' IS NULL';
				} else if (operator === '!=' || operator === '<>' || operator === 'NOT') {
					return propertyName + ' IS NOT NULL';
				}
			}

			if (Array.isArray(param)) {
				var op = operator.toLowerCase();
				if ("between" === op) {
					return propertyName + ' BETWEEN ' + param.join(' AND ');
				} else if ("in" === op) {
					return propertyName + ' IN [' + param.join(', ') + "] ";
				}
			}

			return propertyName + ' ' + operator + ' ' + param;
		}
	}, {
		key: 'convertToRID',
		value: function convertToRID(value) {
			if (typeof value === "string" && rRIDLike.test(value)) {
				value = "#" + value;
			}
			var oldvalue = new _orientjs.RecordID(value);
			if (oldvalue) {
				value = oldvalue;
			}
			return value;
		}
	}, {
		key: 'queryLanguage',
		value: function queryLanguage(conditions) {
			var _this = this;

			var items = [];

			Object.keys(conditions).forEach(function (propertyName) {

				if (propertyName === '_id') {
					propertyName = '@rid';
				}

				var value = conditions[propertyName];
				if (typeof value === 'undefined') {
					return;
				}

				if (_logicoperators2.default[propertyName]) {
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

					var query = '(' + subQueries.join(') ' + _logicoperators2.default[propertyName] + ' (') + ')';
					return items.push(query);
				}

				// if(value instanceof RecordID) {
				// value = value.toString();
				// }

				if (!_lodash2.default.isObject(value) || value instanceof _orientjs.RecordID) {
					var query = _this.createComparisonQuery(propertyName, '=', value);
					return items.push(query);
				}

				Object.keys(value).forEach(function (operation) {
					var operationValue = value[operation];
					// if(value instanceof RecordID) {
					// value = value.toString();
					// }

					var query = null;
					if (_comparisonoperators2.default[operation]) {
						query = _this.createComparisonQuery(propertyName, _comparisonoperators2.default[operation], operationValue);
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

			return items.join(' AND ');
		}
	}, {
		key: 'operator',
		value: function operator(_operator, conditions, callback) {
			var query = this.queryLanguage(conditions);

			if (!query) {
				return this;
			}

			this._operators.push({
				type: _operator,
				query: query
			});

			return this;
		}
	}, {
		key: 'condExec',
		value: function condExec(conditions, callback) {
			if (typeof conditions === 'function') {
				callback = conditions;
				conditions = void 0;
			}

			if (typeof conditions === 'string') {
				this._target = conditions;
				conditions = void 0;
			}

			if (_lodash2.default.isObject(conditions)) {
				if (conditions instanceof _document2.default) {
					this._target = conditions;
					conditions = void 0;
				} else if (conditions instanceof _orientjs.RecordID) {
					this._target = conditions;
					conditions = void 0;
				} else {
					this.where(conditions);
				}
			}
			return this; // making exec implicit
		}
	}, {
		key: 'or',
		value: function or(conditions) {
			var self = this;
			conditions.forEach(function (condition) {
				self = self.operator(Operator.OR, condition);
			});
			return self;
		}
	}, {
		key: 'and',
		value: function and(conditions) {
			var self = this;
			conditions.forEach(function (condition) {
				self = self.operator(Operator.AND, condition);
			});
			return self;
		}
	}, {
		key: 'let',
		value: function _let(name, statement) {
			this._let[name] = statement;
			return this;
		}
	}, {
		key: 'where',
		value: function where(conditions, callback) {
			conditions = conditions || {};
			this.operator(Operator.WHERE, conditions);

			return this.condExec(callback);
		}
	}, {
		key: 'operation',
		value: function operation(_operation) {
			if (this._operation && this._operation !== _operation) {
				throw new Error('Operation is already set');
			}
			this._operation = _operation;
			return this;
		}
	}, {
		key: 'set',
		value: function set(doc) {
			this._set = doc;
			return this;
		}
	}, {
		key: 'first',
		value: function first(useFirst) {
			this._first = !!useFirst;
			return this;
		}
	}, {
		key: 'raw',
		value: function raw() {
			this._raw = true;
			return this;
		}
	}, {
		key: 'scalar',
		value: function scalar(useScalar) {
			this._scalar = !!useScalar;
			return this;
		}
	}, {
		key: 'limit',
		value: function limit(_limit) {
			this._limit = _limit;
			return this;
		}
	}, {
		key: 'skip',
		value: function skip(_skip) {
			this._skip = _skip;
			return this;
		}
	}, {
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
		key: 'group',
		value: function group(key) {
			this._group = this._group || [];
			var args = Array.prototype.slice.call(arguments);
			this._group.push.apply(this._group, args);
			return this;
		}
	}, {
		key: 'sort',
		value: function sort(_sort) {
			if (typeof _sort === 'string') {
				var order = {};

				var parts = _sort.split(' ');
				parts.forEach(function (part) {
					var direction = 1;
					if (part[0] === '-') {
						part = part.substr(1);
						direction = -1;
					}

					order[part] = direction;
				});

				_sort = order;
			}

			this._sort = _sort;
			return this;
		}
		/**
  update(doc, [callback])
  */

	}, {
		key: 'create',
		value: function create(doc, callback) {
			if (typeof doc === 'function') {
				callback = doc;
				doc = {};
			}
			return this.operation(Operation.INSERT).set(doc).first(true).condExec(callback);
		}

		/**
  update(conditions, update, [options], [callback])
  */

	}, {
		key: 'update',
		value: function update(conditions, doc, options) {
			if (typeof options === 'function') {
				callback = options;
				options = {};
			}
			options = options || {};

			if (typeof conditions === 'undefined' || typeof doc === 'undefined') {
				throw new Error('One of parameters is missing');
			}

			return this.operation(Operation.UPDATE).limit(options.multi ? null : 1).set(doc).scalar(true).condExec(conditions, true);
		}

		//find([conditions], [callback])

	}, {
		key: 'find',
		value: function find(conditions) {
			return this.operation(Operation.SELECT).condExec(conditions, true);
		}

		//findOne([criteria], [callback])

	}, {
		key: 'findOne',
		value: function findOne(conditions) {
			return this.operation(Operation.SELECT).limit(1).first(true).condExec(conditions, true);
		}

		//remove([conditions], [callback])

	}, {
		key: 'remove',
		value: function remove(conditions) {
			return this.operation(Operation.DELETE).scalar(true).condExec(conditions, true);
		}
	}, {
		key: 'transaction',
		value: function transaction(_transaction) {
			this._transaction = _transaction;
			return this;
		}
	}, {
		key: 'then',
		value: function then(fn) {
			return this.exec(fn);
		}
	}, {
		key: 'map',
		value: function map(fn) {
			return this.exec().map(fn);
		}
	}, {
		key: 'exec',
		value: function exec(fn) {
			var _this2 = this;

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
				query = new _query2.default(model.connection.db);
			}
			var q = query;

			var target = this._target && this._target['@rid'] ? this._target['@rid'] : this._target;

			var isGraph = schema instanceof _graph2.default;
			var selects;
			if (this._selects.length > 0) {
				this._selects.push("@version");
				selects = this._selects.join(",");
			} else {
				selects = "*, @version";
			}
			if (isGraph) {
				var graphType = schema instanceof _edge2.default ? 'EDGE' : 'VERTEX';

				if (operation === Operation.INSERT) {
					query = query.create(graphType, target);
				} else if (operation === Operation.DELETE) {
					query = query.delete(graphType, target);
				} else if (operation === Operation.SELECT) {
					query = query.select(selects).from(target);
				} else {
					query = query.update(target);
				}
			} else {
				if (operation === Operation.INSERT) {
					query = query.insert().into(target);
				} else if (operation === Operation.DELETE) {
					query = query.delete().from(target);
				} else if (operation === Operation.SELECT) {
					query = query.select(selects).from(target);
				} else {
					query = query.update(target);
				}
			}

			if (this._from) {
				query.from(this._from && this._from['@rid'] ? this._from['@rid'] : this._from);
			}

			if (this._to) {
				query.to(this._to && this._to['@rid'] ? this._to['@rid'] : this._to);
			}

			if (this._set && Object.keys(this._set).length) {
				query.set(this._set);
			}

			this._operators.forEach(function (operator) {
				query = query[operator.type](operator.query);
			});

			for (var name in this._let) {
				query = query.let(name, this._let[name]);
			}

			query.addParams(this._params);

			if (!this._scalar && !this._raw && !this._group && (operation === Operation.SELECT || operation === Operation.INSERT)) {
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
					var value = _this2._sort[key];
					order[key] = value === 'asc' || value === 'ascending' || value === 1 ? 'ASC' : 'DESC';
				});

				query = query.order(order);
			}

			if (this._group) {
				query = query.group.apply(query, this._group);
			}

			log(q.buildStatement(), q.buildOptions());

			var promise = query.exec().then(function (results) {
				if (!results) {
					return _bluebird2.default.resolve(results);
				}

				if (_this2._first) {
					results = results[0];
				}

				if (_this2._scalar && results.length) {
					results = parseInt(results[0]);
				}
				return _bluebird2.default.resolve(results);
			});
			if (fn) {
				return promise.then(fn);
			}
			return promise;
		}
	}, {
		key: 'model',
		get: function get() {
			return this._model;
		}
	}, {
		key: 'schema',
		get: function get() {
			return this.model.schema;
		}
	}]);

	return Query;
}();

exports.default = Query;