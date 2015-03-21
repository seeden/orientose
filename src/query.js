import OrientoQuery from 'oriento/lib/db/query';
import debug from 'debug';

const log = debug('orientose:query');

const Action = {
	DELETE : 'delete',
	UPDATE : 'update',
	SELECT : 'select',
	CREATE : 'insert'
};

const Operation = {
	OR: 'or',
	AND: 'and',
	WHERE : 'where',
	SET: 'set'
};

export default class Query {
	constructor(model, options) {
		options = options || {};

		if(!model) {
			throw new Error('Model is not defined');
		}

		this._model = model;

		this._one    = false;
		this._scalar = false;
		this._limit  = null;
		this._action = null;
		this._params = [];
		this._set    = null;
	}

	get model() {
		return this._model;
	}

	exec(callback) {
		callback = callback || function() {};

		var model = this.model;

		var action = this._action;
		if(!action) {
			throw new Error('Action is not defined');
		}

		var query = new OrientoQuery(model.connection.db);
		var q = query;

		query = query[action]();
		query = (action === Action.CREATE) 
			? query.into(model.name) 
			: query.from(model.name);

		this._params.forEach(function(params) {
			query = query[params.operation](params.conditions);
		});

		if(action === Action.SELECT || action === Action.CREATE) {
			query = query.transform(function(record) {
				return model._createDocument(record);
			});
		}

		if(this._limit) {
			query = query.limit(this._limit);
		}

		if(this._one) {
			query = query.one();
		}

		if(this._scalar) {
			query = query.scalar();
		}

		log(q.buildStatement(), q.buildOptions());

		return query.then((results) => {
			callback(null, results);
		}, callback);
	}

	operation(operation, cond, callback) {
		this._params.push({
			operation: operation,
			conditions: cond
		});

		return this;
	}

	where(cond, callback) {
		if(cond.$or) {
			cond.$or.forEach((cond) => {
				this.operation(Operation.OR, cond);
			});
		} else if(cond.$and) {
			cond.$and.forEach((cond) => {
				this.operation(Operation.AND, cond);
			});
		} else {
			this.operation(Operation.WHERE, cond);
		}

		return this.condExec(callback);
	}

	condExec(cond, callback) {
		if(typeof cond === 'function') {
			callback = cond;
			cond = void 0;
		}	

		if(cond) {
			this.where(cond);
		}

		return callback ? this.exec(callback) : this;
	}

	remove(cond, callback) {
		this._action = Action.DELETE;

		this._scalar = true;
		this._one = true;
		this._limit = 1;
		
		return this.condExec(cond, callback);
	}

	find(cond, callback) {
		this._action = Action.SELECT;

		return this.condExec(cond, callback);
	}

	findOne(cond, callback) {
		this._one = true;
		this._limit = 1;

		return this.find(cond, callback);			
	}

	update(criteria, options, callback) {
		this._action = Action.UPDATE;

		this._one = true;
		this._limit = 1;

		return this.condExec(criteria, callback);
	}	

	create(doc, callback) {
		this._action = Action.CREATE;

		this._one = true;

		this.operation(Operation.SET, doc);
		return this.condExec(callback);
	}
}

