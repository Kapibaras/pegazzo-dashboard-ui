import { AUTH_ERRORS } from './auth';
import { COMMON_ERRORS } from './common';
import { USER_ERRORS } from './user';
import { BALANCE_ERRORS } from './balance';
import { VEHICLE_ERRORS } from './vehicle';
import { DRIVER_ERRORS } from './driver';

export const ERROR_MESSAGES = {
  auth: AUTH_ERRORS,
  common: COMMON_ERRORS,
  users: USER_ERRORS,
  balance: BALANCE_ERRORS,
  vehicles: VEHICLE_ERRORS,
  drivers: DRIVER_ERRORS,
} as const;
