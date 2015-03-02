require("babel/register");

import Connection from './connection';
import Schema from './schema';
import Model from './model';

Connection.Schema = Schema;
Connection.Model = Model;

export default Connection;