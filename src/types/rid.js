import StringType from './string';
import _ from 'lodash';

export default class RIDType extends StringType {
	_serialize(value) {
		if(_.isPlainObject(value)) {
			value = RIDType.objectToString(value);
		} else if (value && value['@rid']) {
			value = value['@rid'];
		}

		return super._serialize(value);
	}

	static getDbType(options) {
		return 'LINK';
	}

	static objectToString(obj) {
		if(obj && typeof obj.cluster!=='undefined' && typeof obj.position!=='undefined') {
			return '#' + obj.cluster + ':' + obj.position;
		}

		return null;
	}
}