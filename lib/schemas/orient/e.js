import OrientSchema from './index';
import RidType from '../../types/rid';

const BASE_EDGE_CLASS = 'E';

export default class E extends OrientSchema {
	constructor(props, options) {
		options = options || {};
		options.extend = options.extend || BASE_EDGE_CLASS;

		super(props, options);

		//add default properties
		this.add({
			'in'  : { type: RidType, required: true, notNull: true }, //from
			'out' : { type: RidType, required: true, notNull: true }  //to
		});

		this.alias('in', 'from');
		this.alias('out', 'to');

		if(options.unique) {
			this.index({ 
				'in'  : 1, 
				'out' : 1  
			}, { unique: true });
		}
	}

	get isEdge() {
		return true;
	}
}