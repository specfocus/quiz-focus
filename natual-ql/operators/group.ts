import { Operator } from '../types/Operator'
import { extendCase } from '../utils/operator'

export const groupSynonyms: Operator[] = extendCase([
  { label: 'any', field: 'any', synonyms: ['events', "event's"] }
])

export const groupnameSynonyms: Operator[] = extendCase([
  { label: 'category', field: 'category' },
  { label: 'domain', field: 'domain' },
  { label: 'custom float', field: 'float' },
  { label: 'hostname', field: 'hostname' },
  { label: 'id', field: 'id' },
  /*  { label: 'int', field: 'int' }, */
  { label: 'ip', field: 'ip' },
  { label: 'ip6', field: 'ip6' },
  { label: 'label', field: 'label' },
  { label: 'mac', field: 'mac' },
  /*  { label: 'name', field: 'name' }, */
  { label: 'path', field: 'path' },
  { label: 'port', field: 'port' },
  /*  { label: 'text', field: 'text' }, */
  { label: 'timestamp', field: 'timestamp', synonyms: ['time'] },
  /*  { label: 'uint', field: 'uint' }, */
  { label: 'uri', field: 'uri' },
  { label: 'url', field: 'url' },
  { label: 'username', field: 'username', synonyms: ['user'] }
])

for (const s of groupnameSynonyms) {
  s.isGroupname = true;
}