import { Operator } from '../types/Operator'
import { extendCase } from '../utils/operator'

export const joinSynonyms: Operator[] = extendCase([
  {
    label: 'in list',
    field: 'in list',
    synonyms: ['in list of', 'match'],
    dbOperation: 'inner'
  }, {
    label: 'not in list',
    field: 'not in list',
    synonyms: ['not in list of', 'not match'],
    dbOperation: 'left'
  }
])