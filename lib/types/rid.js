import StringType from './string';
import _ from 'lodash';

export default class RIDType extends StringType {

	_serialize(value) {
		if(value && value.cluster && value.position) {
			value = '#' + value.cluster + ':' + value.position;
		}

		return super._serialize(value);
	}

	static get dbType() {
		throw new Error('This type can not be used for class extend');
	}

	static objectToString(obj) {
		if(obj && typeof obj.cluster!=='undefined' && typeof obj.position!=='undefined') {
			return '#' + obj.cluster + ':' + obj.position;
		}

		return null;
	}
}