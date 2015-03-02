require("babel/register");

import Connection from './connection';
import SchemaOrient from './schemas/orient';
import Model from './model';
import Type from './types/index';

Connection.Schema = SchemaOrient;
Connection.Model = Model;
Connection.Type = Type;

export default Connection;