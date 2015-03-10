import Type from './type';
import StringType from './string';
import NumberType from './number';
import BooleanType from './boolean';
import DateType from './date';
import ObjectType from './object';
import ArrayType from './array';
import _ from 'lodash';

export default function(type) {
	if(!type) {
		throw new Error('Type is not deefined');
	} else if(type.isSchemaType) {
		return type;
	} else if(type.isSchema) {
		return ObjectType;
	} else if(_.isArray(type)) {
		if(!type.length) {
			throw new Error('You need to specify type of an array item');
		}
		return ArrayType;
	} else if(type === String) {
		return StringType;
	} else if(type === Number) {
		return NumberType;
	} else if(type === Boolean) {
		return BooleanType;
	} else if(type === Date) {
		return DateType;
	}

	throw new Error('Unrecognized type');
}