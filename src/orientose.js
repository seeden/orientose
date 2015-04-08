import Connection from './connection';
import SchemaOrient from './schemas/orient';
import SchemaV from './schemas/orient/v';
import SchemaE from './schemas/orient/e';
import Model from './model';
import Type from './types/index';
import Oriento from "oriento";

SchemaOrient.E = SchemaE;
SchemaOrient.V = SchemaV;
SchemaOrient.ObjectId = Type.Rid; //mongoose compatible

Connection.Schema = SchemaOrient;

Connection.Model = Model;
Connection.Type = Type;
Connection.Oriento = Oriento;
class RawType {
	constructor(raw) {
		this._raw = raw;
		this.__orientose_raw__ = true;
	}
	toString() {
		return this._raw;
	}
}


Connection.RawType = RawType;
Connection.raw = function(raw){ return new RawType(raw); };

export default Connection;