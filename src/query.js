import OrientoQuery from 'oriento/lib/db/query';
import debug from 'debug';
import _ from 'lodash';
import Document from './document';
import GraphSchema from './schemas/graph';
import EdgeSchema from './schemas/edge';
import { RecordID } from 'oriento';
import LogicOperators from './constants/logicoperators';
import ComparisonOperators from './constants/comparisonoperators';
import extend from "node.extend";
import Promise from 'bluebird';

const log = debug('orientose:query');

const Operation = {
	DELETE : 'DELETE',
	UPDATE : 'UPDATE',
	SELECT : 'SELECT',
	INSERT : 'INSERT'
};

const Operator = {
	OR: 'or',
	AND: 'and',
	WHERE : 'where'
};

export default class Query {
	constructor(model, options) {
		options = options || {};

		if(!model) {
			throw new Error('Model is not defined');
		}

		this._paramIndex = 1;

		this._model = model;
		this._target = model.name;

		this._first    = false;
		this._scalar = false;
		this._raw = false;

		this._limit  = null;
		this._skip   = null;
		this._sort   = null;

		this._from   = null;
		this._to     = null;
		this._let 	 = {};

		this._selects = [];
		
		this._operation = null;

		this._params = {};

		this._operators = [];
		this._set    = null;
		var self = this;
		for ( var name in this._model._documentClass) {
			this[name] = (function(name){
				return function(){
					return self._model._documentClass[name].apply(self, arguments);
				};
			})(name);
		}
	}

	get model() {
		return this._model;
	}

	get schema() {
		return this.model.schema;
	}

	count(key) {
		return this.select('count('+key+')');
	}

	select(key) {
		this._selects.push(key);
		return this;
	}

	paramify (key) {
  		return key.replace(/([^A-Za-z0-9])/g, '');
	}

	nextParamName(propertyName) {
		return this.paramify(propertyName)+'_op_'+this._paramIndex++;
	}

	addParam(paramName, value) {
		this._params[paramName] = value;
	}

	addParams(params) {
		params = params || {};
		extend(this._params, params);
	}

	createComparisonQuery(propertyName, operator, value) {
		var param;
		if ( true === value.__orientose_raw__ ) {
			param = value;
		} else if ( Array.isArray(value) ) {
			param = [];
			for ( var i = 0; i < value.length; i++ ) {
				var paramName = this.nextParamName(propertyName);
				param[i] = ":"+paramName;
				this.addParam(paramName, value[i]);
			}
		} else {
			var paramName = this.nextParamName(propertyName);
			param = ":"+paramName;
			this.addParam(paramName, value);
		}
		if(value === null) {
			if(operator === '=') {
				return propertyName + ' IS NULL';
			} else if(operator === '!=' || operator === '<>' || operator === 'NOT') {
				return propertyName + ' IS NOT NULL';
			}
		}

		if ( Array.isArray(value) ) {
			var op = operator.toLowerCase();
			if ( "between" === op ) {
				return propertyName + ' BETWEEN ' + param.join(' AND ');
			} else if ( "in" === op ) {
				return propertyName + ' IN (' + param.join(', ') + ") ";
			}
		}
		
		return propertyName + ' ' + operator + ' ' + param;		
	}

	queryLanguage(conditions) {
		var items = [];

		Object.keys(conditions).forEach(propertyName => {
			if(propertyName === '_id') {
				propertyName = '@rid';
			}

			var value = conditions[propertyName];
			if(typeof value === 'undefined') {
				return;
			}

			if(LogicOperators[propertyName]) {
				var subQueries = [];
				
				value.forEach(conditions => {
					var query = this.queryLanguage(conditions);
					if(!query) {
						return;
					}

					subQueries.push(query);
				});

				if(!subQueries.length) {
					return;
				} else if(subQueries.length === 1) {
					return items.push(subQueries[0]);
				}

				var query = '(' + subQueries.join(') ' + LogicOperators[propertyName] + ' (') + ')';
				return items.push(query);
			}

			if(value instanceof RecordID) {
				value = value.toString();
			}

			if(!_.isObject(value)) {
				var query = this.createComparisonQuery(propertyName, '=', value);
				return items.push(query);
			}

			Object.keys(value).forEach(operation => {
				var operationValue = value[operation];
				if(value instanceof RecordID) {
					value = value.toString();
				}

				var query = null;
				if(ComparisonOperators[operation]) {
					query = this.createComparisonQuery(propertyName, 
						ComparisonOperators[operation], operationValue);
				}

				if(!query) {
					return;
				}

				items.push(query);
				
			});
		});

		if(!items.length) {
			return null;
		}

		return items.join(' AND ');
	}

	operator(operator, conditions, callback) {
		var query = this.queryLanguage(conditions);

		if(!query) {
			return this;
		}

		this._operators.push({
			type: operator,
			query: query
		});

		return this;
	}

	condExec(conditions, callback) {
		if(typeof conditions === 'function') {
			callback = conditions;
			conditions = void 0;
		}	

		if(typeof conditions === 'string') {
			this._target = conditions;
			conditions = void 0;
		}

		if(_.isObject(conditions)) {
			if(conditions instanceof Document) {
				this._target = conditions;
				conditions = void 0;
			} else if(conditions instanceof RecordID) {
				this._target = conditions;
				conditions = void 0;
			} else {
				this.where(conditions);
			}
		}
		return this; // making exec implicit
	}

	or(conditions) {
		var self = this;
		conditions.forEach(function(condition) {
			self = self.operator(Operator.OR, condition);
		});
		return self;
	}

	and(conditions) {
		var self = this;
		conditions.forEach(function(condition) {
			self = self.operator(Operator.AND, condition);
		});
		return self;
	}

	let(name, statement) {
		this._let[name] = statement;
		return this;
	}

	where(conditions, callback) {
		conditions = conditions || {};
		this.operator(Operator.WHERE, conditions);

		return this.condExec(callback);
	}

	operation(operation) {
		if(this._operation && this._operation !== operation) {
			throw new Error('Operation is already set');
		}
		this._operation = operation;
		return this;
	}

	set(doc) {
		this._set = doc;
		return this;	
	}

	first(useFirst) {
		this._first = !!useFirst;
		return this;
	}

	raw() {
		this._raw = true;
		return this;
	}

	scalar(useScalar) {
		this._scalar = !!useScalar;
		return this;
	}

	limit(limit) {
		this._limit = limit;
		return this;
	}	

	skip(skip) {
		this._skip = skip;
		return this;
	}

	from(value) {
		this._from = value;
		return this;
	}

	to(value) {
		this._to = value;
		return this;
	}		

	sort(sort) {
		if(typeof sort === 'string') {
			var order = {};

			var parts = sort.split(' ');
			parts.forEach(function(part) {
				var direction = 1;
				if(part[0] === '-') {
					part = part.substr(1);
					direction = -1;
				}

				order[part] = direction;
			});

			sort = order;
		}

		this._sort = sort;
		return this;
	}
	/**
	update(doc, [callback])
	*/
	create(doc, callback) {
		if(typeof doc === 'function') {
			callback = doc;
			doc = {};
		}
		return this
			.operation(Operation.INSERT)
			.set(doc)
			.first(true)
			.condExec(callback);
	}

	/**
	update(conditions, update, [options], [callback])
	*/
	update(conditions, doc, options) {
		if(typeof options === 'function') {
			callback = options;
			options = {};
		}
		options = options || {};

		if(typeof conditions === 'undefined' || typeof doc === 'undefined') {
			throw new Error('One of parameters is missing');
		}

		return this
			.operation(Operation.UPDATE)
			.limit(options.multi ? null : 1)
			.set(doc)
			.scalar(true)
			.condExec(conditions, true);
	}	

	//find([conditions], [callback])
	find(conditions) {
		return this
			.operation(Operation.SELECT)
			.condExec(conditions, true);
	}

	//findOne([criteria], [callback])
	findOne(conditions) {
		return this
			.operation(Operation.SELECT)
			.limit(1)
			.first(true)
			.condExec(conditions, true);	
	}	

	//remove([conditions], [callback])
	remove(conditions) {
		return this
			.operation(Operation.DELETE)
			.scalar(true)
			.condExec(conditions, true);
	}

	transaction(transaction){
		this._transaction = transaction;
		return this;
	}

	then(fn){
		return this.exec(fn);
	}

	map(fn) {
		return this.exec().map(fn);
	}

	exec(fn) {

		var model = this.model;
		var schema = model.schema;
		var operation = this._operation;
		if(!operation) {
			this.operation(Operation.SELECT);
			operation = this._operation;
			// lets default this as select unless otherwise
			// return Promise.reject(new Error('Operation is not defined'));
		}


		var query;
		if ( this._transaction ) {
			query = this._transaction;
		} else {
			query = new OrientoQuery(model.connection.db);
		}
		var q = query;

		var target = this._target && this._target['@rid'] 
			? this._target['@rid'] 
			: this._target;
			console.log('AT LEAST WE REACHED HERE?!?!?');

		var isGraph = schema instanceof GraphSchema;
		var selects;
		if ( this._selects.length > 0 ) {
			selects = this._selects.join(",");
		}
		if(isGraph) {
			var graphType = schema instanceof EdgeSchema ? 'EDGE' : 'VERTEX';

			if(operation === Operation.INSERT) {
				query = query.create(graphType, target);
			} else if(operation === Operation.DELETE) {
				query = query.delete(graphType, target);
			} else if(operation === Operation.SELECT) {
				query = query.select(selects).from(target);
			} else {
				query = query.update(target);
			}
		} else {
			if(operation === Operation.INSERT) {
				query = query.insert().into(target);
			} else if(operation === Operation.DELETE) {
				query = query.delete().from(target);
			} else if(operation === Operation.SELECT) {
				query = query.select(selects).from(target);
			} else {
				query = query.update(target);
			}			
		}	

		if(this._from) {
			query.from(this._from && this._from['@rid'] ? this._from['@rid'] : this._from);
		}	

		if(this._to) {
			query.to(this._to && this._to['@rid'] ? this._to['@rid'] : this._to);
		}			

		if(this._set) {
			query.set(this._set);
		}

		this._operators.forEach(function(operator) {
			query = query[operator.type](operator.query);
		});

		for ( var name in this._let ) {
			query = query.let(name, this._let[name]);
		}

		query.addParams(this._params);

		if(!this._scalar && !this._raw && (operation === Operation.SELECT || operation === Operation.INSERT)) {
			query = query.transform(function(record) {
				return model._createDocument(record);
			});
		}

		if(this._limit) {
			query = query.limit(this._limit);
		}

		if(this._skip) {
			query = query.skip(this._skip);
		}		

		if(this._sort) {
			var order = {};

			Object.keys(this._sort).forEach(key => {
				var value = this._sort[key];
				order[key] = value === 'asc' || value === 'ascending' || value === 1
					? 'ASC' 
					: 'DESC';
			});

			query = query.order(order);
		}

		log(q.buildStatement(), q.buildOptions());

		var promise = query.exec().then(results => {
			if(!results) {
				return Promise.resolve(results);
			}

			if(this._first) {
				results = results[0];
			}

			if(this._scalar && results.length) {
				results = parseInt(results[0]);
			}
			return Promise.resolve(results);
		});
		if ( fn ) {
			return promise.then(fn);
		}
		return promise;
	}		
}