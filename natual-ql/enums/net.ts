import { IP, IPV4, IPV6, IP6, MAC } from '../constants/net'

export const IP_TYPES = {
  IP: IP,
  IPV4: IPV4,
  IPV6: IPV6,
  IP6: IP6,
  MAC: MAC
}

export const nonOrderedTypes = [
  'category',
  'domain',
  'hostname',
  'id',
  'label',
  'path',
  'uri',
  'url',
  'username',
  'string' // cefType, other are valueTypes
]