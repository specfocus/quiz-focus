import { AsyncAction } from '@specfocus/main-focus/actions/async';
import { DataSource } from '../resources/source';

export const LEARN = 'learn';

export type LearnActionType = typeof LEARN;

/**
 * Find bucket lists, object list, endpoints, etc
 */
export interface LearnAction extends Omit<AsyncAction, 'atom' | 'type' | 'what'> {
  type: LearnActionType;
  where: LearnWhere;
}

export interface LearnWhere extends DataSource {}
