import { EventEmitter } from 'events';

export default class Document extends EventEmitter {
	constructor(model, fields) {
		fields = fields || {};

		this._model = model;
		this._data  = new model.schema.DataClass(fields); 

		this._isNew = true;

		this.set(fields);		
	}

	set (fields) {
		this._data.set(fields);
		return this;
	}

	get isNew() {
		return this._isNew;
	}

	save(callback) {
		this._isNew = false;
	}

	static createClass (model) {
		class DocumentModel extends Document {
			constructor(fields) {
				super(model, fields);
			}
		};

		//add basic data getters and setters
		model.schema.traverse(function(fieldName, fieldOptions) {
			Object.defineProperty(DocumentModel.prototype, fieldName, {
				enumerable: true,
				configurable: true,
				get: function() {
					return this._data[fieldName];
				},
				set: function(value) {
					this._data[fieldName] = value;
					return this;
				}
			});
		});

		return DocumentModel;
	}
}