import { AUTH_ERRORS } from './auth';
import { COMMON_ERRORS } from './common';
import { USER_ERRORS } from './user';
import { BALANCE_ERRORS } from './balance';

export const ERROR_MESSAGES = {
  auth: AUTH_ERRORS,
  common: COMMON_ERRORS,
  users: USER_ERRORS,
  balance: BALANCE_ERRORS,
} as const;
