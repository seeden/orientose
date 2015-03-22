import { EventEmitter } from 'events';

export default class Document extends EventEmitter {
	constructor(model, properties, options) {
		properties = properties || {};

		this._model = model;
		this._data  = new model.schema.DataClass(properties); 

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

	isModified(path) {
		return this._data.isModified(path);
	}

	setupData(properties) {
		this._data.setupData(properties);
		this._isNew = false;
		return this;
	}

	toJSON(options) {
		return this._data.toJSON(options);
	}

	save(callback) {
		var hooks = this._model.schema.hooks;
		hooks.execPre('validate', this, error => {
			if(error) {
				return callback(error);
			}			

			hooks.execPre('save', this, error => {
				if(error) {
					return callback(error);
				}

				var properties = this.toJSON({
					virtuals: false,
					metadata: false,
					modified: true
				});

				if(this.isNew) {
					this._model.create(properties).from(this._from).to(this._to).exec((error, user) => {
						if(error) {
							return callback(error);
						}

						this.setupData(user.toJSON({
							virtuals: false
						}));

						callback(null, this);
					});

					return;
				} 

				this._model.update(this, properties, (err, total) => {
					if(err) {
						return callback(err);
					}

					this.setupData(properties);
					callback(null, this);
				});
			});
		});
	}

	remove(callback) {
		var model = this._model;
		var hooks = model.schema.hooks;

		if(this.isNew) {
			return callback(null, this);
		}

		hooks.execPre('remove', this, (error) => {
			if(error) {
				return callback(error);
			}

			model.remove(this, callback);
		});
	}

	static findById(id, callback) {
		this.findOne(id, callback);
	}

	static findOne(conditions, callback) {
		return this.model.findOne(conditions, callback);
	}

	static find(conditions, callback) {
		return this.model.find(conditions, callback);
	}

	static create(properties, callback) {
		return new this(properties).save(callback);
	}

	static remove(conditions, callback) {
		return this.model.remove(conditions, callback);
	}

	static get model() {
		throw new Error('You need to override model getter');
	}

	static createClass (model) {
		class DocumentModel extends Document {
			constructor(properties) {
				super(model, properties);
			}

			static get model() {
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