/*
 * File: /Users/origami/Desktop/templates/node-express-template/src/apiv1/index.ts
 * Project: /Users/origami/Desktop/templates/node-express-template
 * Created Date: Friday July 12th 2019
 * Author: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 * Last Modified: Friday July 12th 2019 3:23:10 pm
 * Modified By: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 */
import UserController from './user';
import AuthController from './auth';
import { SubscriptionController } from './subscription/api';
import { LocationController } from './location/api';
import { MembershipController } from './member/api';

export default [
  UserController,
  AuthController,
  SubscriptionController,
  LocationController,
  MembershipController,
];
