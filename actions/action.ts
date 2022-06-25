
import { LEARN, type LearnAction } from './learn';
import { QUERY, type QueryAction } from './query';
import { ACTION_TYPES as BASE_ACTION_TYPES, type Action as SuperAction } from '@specfocus/main-focus/actions/action';

export const ACTION_TYPES = [
  ...BASE_ACTION_TYPES,
  LEARN,
  QUERY
] as const;

export type ActionType = typeof ACTION_TYPES[number];

export type Action =
  | SuperAction
  | LearnAction
  | QueryAction;