import StringType from './string';
import NumberType from './number';
import BooleanType from './boolean';

export default function(type) {
	if(type === String) {
		return StringType;
	} else if(type === Number) {
		return NumberType;
	} else if(type === Boolean) {
		return BooleanType;
	}

	throw new Error('Unrecognized type');
}