import { Operator } from '../types/Operator'
import { extendCase } from '../utils/operator'

export const unaryOperatorSynonyms: Operator[] = extendCase([
  {
    label: 'equals',
    field: '=',
    synonyms: ['=', '==', 'is equal to', 'is equal', 'is', 'equal'],
    cefTypes: ['string', 'int', 'long', 'float', 'bin16'],
    exactType: true
  }, {
    label: 'not equal',
    field: '<>',
    synonyms: ['<>', '!=', 'is not equal to', 'is not equal', 'is not', 'not equals'],
    cefTypes: ['string', 'int', 'long', 'float', 'bin16'],
    exactType: true
  }, {
    label: 'less than',
    field: '<',
    synonyms: ['<', 'is less than', 'is less', 'is lower than', 'is lower', 'less'],
    cefTypes: ['int', 'long', 'float', 'bin16'],
    exactType: true
  }, {
    label: 'greater than',
    field: '>',
    synonyms: ['>', 'is greater than', 'is greater', 'is larger than', 'is larger', 'greater'],
    cefTypes: ['int', 'long', 'float', 'bin16'],
    exactType: true
  }, {
    label: 'less equal than',
    field: '<=',
    synonyms: ['<=', 'is less or equal than', 'is less than or equal to',
      'is less equal', 'lte', 'less equal'],
    cefTypes: ['int', 'long', 'float', 'bin16'],
    exactType: true
  }, {
    label: 'greater equal than',
    field: '>=',
    synonyms: ['>=', 'is greater or equal than', 'is greater than or equal to',
      'is greater equal', 'gte', 'greater equal'],
    cefTypes: ['int', 'long', 'float', 'bin16'],
    exactType: true
  }, {
    label: 'contains',
    field: 'contains',
    synonyms: ['contain', 'like', 'has', 'has substring'],
    cefTypes: ['string']
  }, {
    label: 'does not contain',
    field: 'does not contain',
    synonyms: ['does not contain', 'does not have'],
    cefTypes: ['string']
  }, {
    label: 'starts with',
    field: 'starts with',
    synonyms: ['startswith'],
    cefTypes: ['string']
  }, {
    label: 'ends with',
    field: 'ends with',
    synonyms: ['endswith'],
    cefTypes: ['string']
  }, {
    label: 'does not start with',
    field: 'does not start with',
    cefTypes: ['string']
  }, {
    label: 'does not end with',
    field: 'does not end with',
    cefTypes: ['string']
  }, {
    label: 'in subnet',
    field: 'in subnet',
    synonyms: ['insubnet', 'within subnet', 'withinsubnet', 'in CIDR block', 'in cidr block',
      'inCIDRblock', 'incidrblock'],
    cefTypes: ['bin16'],
    exactType: true
  }, {
    label: 'not in subnet',
    field: 'not in subnet',
    synonyms: ['notinsubnet', 'not within subnet', 'notwithinsubnet', 'not in CIDR block',
      'not in cidr block', 'notinCIDRblock', 'notincidrblock'],
    cefTypes: ['bin16'],
    exactType: true
  }
])
