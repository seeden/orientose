import IntegerType from './integer';
import LongType from './long';
import NumberType from './number';
import StringType from './string';
import ArrayType from './array';
import MixedType from './mixed';

export default {
	'Integer': IntegerType,
	'Long': LongType,
	'String': StringType,
	'Number': NumberType,
	EmbeddedList: ArrayType,
	Mixed: MixedType
};