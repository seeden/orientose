import OrientSchema, { prepareSchema } from './index';
import EdgeSchema from '../edge';
import RidType from '../../types/rid';

const BASE_EDGE_CLASS = 'E';

export default class E extends EdgeSchema {
	constructor(props, options) {
		options = options || {};
		options.extend = options.extend || BASE_EDGE_CLASS;

		super(props, options);

		prepareSchema(this);

		//add default properties
		this.add({
			'in'  : { type: RidType, required: true, notNull: true }, //from
			'out' : { type: RidType, required: true, notNull: true }  //to
		});

		if(options.unique) {
			this.index({ 
				'in'  : 1, 
				'out' : 1  
			}, { unique: true });
		}
	}
}