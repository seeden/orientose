import { EventEmitter } from 'events';

export default class Document extends EventEmitter {
	constructor(model, properties, options) {
        super()
		properties = properties || {};

		this._model = model;
		this._data  = new model.schema.DataClass(properties, model.name);

		this._from = null;
		this._to = null;

		this._isNew = true;
	}

	from(value) {
		this._from = value;
		return this;
	}

	to(value) {
		this._to = value;
		return this;
	}

	model(name) {
		return this._model.model(name);
	}

	get(path) {
		return this._data.get(path);
	}

	set(path, value) {
		this._data.set(path, value);
		return this;
	}

	get isNew() {
		return this._isNew;
	}

	transaction(s){
		this._transaction = s;
		return this;
	}

	isModified(path) {
		return this._data.isModified(path);
	}

	setupData(properties) {
		this._data.setupData(properties);
		this._isNew = false;
		if ( require('util').isFunction(this.afterLoad) ) {
			this.afterLoad();
		}
		return this;
	}

	toJSON(options) {
		return this._data.toJSON(options);
	}

	toObject(options) {
		return this._data.toObject(options);
	}

	save(callback) {
		var hooks = this._model.schema.hooks;
		var self = this;
		return new Promise(function(resolve, reject){
			hooks.execPre('validate', self, error => {
				if(error) {
					return reject(error);
				}

				hooks.execPre('save', self, error => {
					if(error) {
						return reject(error);
					}

					var properties = self.toObject({
						virtuals: false,
						metadata: false,
						modified: true,
						query   : false //change by yecn at 2015-08-31 15:29 
					});

					var model = self._model;
					if ( self._transaction ) {
						model.transaction(self._transaction);
					}
					if(self.isNew) {
						return model.create(properties).from(self._from).to(self._to).exec().then((user) => {
							self.setupData(user.toJSON({
								virtuals: false
							}));

							return resolve(self);
						}).catch(reject);
					}

					return model.update(self, properties).exec().then((total) => {

						self.setupData(properties);
						return resolve(self);
					}).catch(reject);
				});
			})
		});
	}

	remove() {
		var model = this._model;
		var hooks = model.schema.hooks;
		var self = this;

		if(this.isNew) {
			return Promise.resolve(this);
		}
		return new Promise((resolve, reject) => {
			hooks.execPre('remove', self, (error) => {
				if(error) {
					return reject(error);
				}

				model.remove(self, true).then(function(result){
					resolve(result);
				}).catch(reject);
			});
		});
	}

	static let(name, statement) {
		return this._model.let(name, statement);
	}

	static exec(){
		return this._model.exec();
	}

	static where(conditions) {
		return this._model.where(conditions);
	}

	static findById(id, callback) {
		return this.findOne(id, callback);
	}

	static findOne(conditions, callback) {
		return this._model
			.findOne(conditions, callback);
	}

	static count(key) {
		return this._model.count(key);
	}

	static find(conditions, callback) {
		return this._model
			.find(conditions, callback);
	}

	static create(properties, callback) {
		return new this(properties)
			.save(callback);
	}

	static update(conditions, doc, options, callback) {
		return this._model
			.update(conditions, doc, options, callback);
	}

	static remove(conditions, callback) {
		return this._model
			.remove(conditions, callback);
	}

	static createClass (model) {
		class DocumentModel extends Document {
			constructor(properties) {
				super(model, properties);
			}

			static model(modelName) {
				return model.model(modelName);
			}

			static get _model() {
				return model;
			}

			static get modelName() {
				return model.name;
			}
		};

		var schema = model.schema;

		//add basic data getters and setters
		schema.traverse(function(fieldName, fieldOptions) {
			Object.defineProperty(DocumentModel.prototype, fieldName, {
				enumerable: true,
				configurable: true,
				get: function() {
					return this.get(fieldName);
				},
				set: function(value) {
					this.set(fieldName, value);
					return this;
				}
			});
		});

		//add methods
		for(var methodName in schema.methods) {
			var fn = schema.methods[methodName];
			DocumentModel.prototype[methodName] = fn;
		}

		//add statics
		for(var staticName in schema.statics) {
			var fn = schema.statics[staticName];
			DocumentModel[staticName] = fn;
		}

		return DocumentModel;
	}
}
