import Path from 'path';
import 'reflect-metadata';
require('dotenv').config({
  path: Path.join(__dirname, '..', '.env'),
});
require('module-alias/register');
import {Jwt} from '../src/utils'

console.log(Jwt.generateTokens('5e64c11a7a189568b8525d27').accessToken)