require("babel/register");

import Connection from './connection';
import SchemaOrient from './schemas/orient';
import Model from './model';

Connection.Schema = SchemaOrient;
Connection.Model = Model;

export default Connection;