import { EventEmitter } from 'events';
import Oriento from 'oriento';
import Model from './model';
import ReadyState from './constants/readystate';

export default class Connection extends EventEmitter {
	constructor (options, dbOptions) {
		options = options || {};
		dbOptions = dbOptions || {};

		if(typeof dbOptions === 'string') {
			var dbName = dbOptions;
			dbOptions = {
				name: dbName
			};
		}

		this._options = options;
		this._dbOptions = dbOptions;

		this._models = {};

		this._server = Oriento(options);
		this._db = this._server.use(dbOptions);
		this._status = null;
		this._readyState = ReadyState.DISCONNECTED;

		this.db.open().then(status => {
			this._status = status;
			this._readyState = ReadyState.CONNECTED;
		}, err => {
			this._readyState = ReadyState.DISCONNECTED;
		});
	}

	get db () {
		return this._db;
	}

	get server () {
		return this._server;
	}

	model (name, schema, options, callback) {
		if(typeof options === 'function') {
			callback = options;
			options = {};
		}

		options = options || {};
		callback = callback || function(){};

		if(typeof schema === 'undefined') {
			if(!this._models[name]) {
				throw new Error('Model does not exists');
			}

			return this._models[name].DocumentClass;
		}

		if(this._models[name]) {
			throw new Error('Model already exists');
		}

		this._models[name] = new Model(name, schema, this, options, function(err, model) {
			if(err) {
				return callback(err);
			}

			callback(null, model.DocumentClass);
		});

		return this._models[name].DocumentClass;
	}

	/*
	Returns an array of model names created on this connection.
	*/
	modelNames() {
		return Object.keys(this._models);
	}

	get readyState() {
		return this._readyState;
	}
}