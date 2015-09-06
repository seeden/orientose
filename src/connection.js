import { EventEmitter } from 'events';
import Oriento from 'orientjs';
import Model from './model';
import ReadyState from './constants/readystate';

import SchemaV from './schemas/orient/v';
import SchemaE from './schemas/orient/e';
import Promise from 'bluebird';

export default class Connection extends EventEmitter {
	constructor (options, dbOptions) {
        super()
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

		this._registerBasicModels();
	}

	get db () {
		return this._db;
	}

	get server () {
		return this._server;
	}

	get Oriento() {
		return Oriento;
	}

	model (name, schema, options) {

		options = options || {};

		if(typeof schema === 'undefined') {
			if(!this._models[name]) {
				throw new Error('Model does not exists');
			}
			return this._models[name].DocumentClass;
		}

		if(this._models[name]) {
			return Promise.reject(new Error('Model already exists'))
		}
		var self = this;
		return new Promise(function(resolve, reject){
			self._models[name] = new Model(name, schema, self, options, function(err, model) {
				if(err) {
					return reject(err);
				}
				resolve(model.DocumentClass);
			});
		})

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

	_registerBasicModels() {
		this.model('V', new SchemaV(), { ensure: false });
		this.model('E', new SchemaE(), { ensure: false });
	}
}
