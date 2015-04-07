import { EventEmitter } from 'events';

export default class Document extends EventEmitter {
	constructor(model, properties, options) {
		super();
		
		properties = properties || {};

		this._model = model;
		this._data  = new model.schema.DataClass(properties, model.name); 
		this._options = options || {};

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

	toObject(options) {
		return this._data.toObject(options);
	}

	forEach(returnType, fn) {
		return this._data.forEach(returnType, fn);
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

				var properties = this.toObject({
					virtuals: false,
					metadata: false,
					modified: !this.isNew,
					query   : true
				});

				if(this.isNew) {
					this._model.create(properties)
						.from(this._from)
						.to(this._to)
						.return(this._options.return)
						.exec((error, user) => {
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

				this._model.update(this, properties).exec((err, total) => {
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
		return this.currentModel
			.findOne(conditions, callback);
	}

	static find(conditions, callback) {
		return this.currentModel
			.find(conditions, callback);
	}

	static create(properties, options, callback) {
		if(typeof options === 'function') {
			callback = options;
			options = {};
		}

		return new this(properties, options)
			.save(callback);
	}

	static update(conditions, doc, options, callback) {
		return this.currentModel
			.update(conditions, doc, options, callback);
	}

	static remove(conditions, callback) {
		return this.currentModel
			.remove(conditions, callback);
	}

	static createClass (model) {
		class DocumentModel extends Document {
			constructor(properties) {
				super(model, properties);
			}

			/**
			Frized api mongoose
			*/
			static model(modelName) {
				return model.model(modelName);
			}

			/**
			Frized api mongoose
			*/
			static get modelName() {
				return model.name;
			}

			static get currentModel() {
				return model;
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