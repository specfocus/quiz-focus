import { Operator } from '../types/Operator'
import { extendCase } from '../utils/operator'

export const calculationFunctionSynonyms: Operator[] = extendCase([
  { label: 'average', field: 'avg', synonyms: ['mean'] },
  { label: 'sum', field: 'sum', synonyms: ['add'] }
])

export const calculationOperatorSynonyms: Operator[] = extendCase([
  { label: '+', field: '+', synonyms: ['plus'] },
  { label: '-', field: '-', synonyms: ['minus'] },
  { label: '*', field: '*', synonyms: ['multiply', 'mul'] },
  { label: '/', field: '/', synonyms: ['divide', 'div'] }
])