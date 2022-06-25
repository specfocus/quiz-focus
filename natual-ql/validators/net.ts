import { IP, IPV4, IPV6, IP6, MAC } from '../constants/net'

export const isIpAddressType = (str: string): boolean =>
  [IP, IPV4, IPV6, IP6, MAC].includes(str)

// Looks for fe80:0000:0000:0000:aaaa:aaff:feaa:aaaa and FE80::aaaa:aaff:feaa:aaaa
export const isContainedMacString = (str: string): boolean =>
  /^(fe80(((:0){3}|(:0{4}){3})|:))(:[0-9a-f]{1,4}){0,1}(:[0-9a-f]{0,2}ff:fe[0-9a-f]{0,2}:[0-9a-f]{1,4})$/i.test(
    str,
  )

export const isMacAddress = (str: string): boolean =>
  isValidLegacyMac(str) ||
  isContainedMacString(str) ||
  /^(([0-9a-f]{4,4}:){3,3}|([0-9a-f]{4,4}-){3,3})[0-9a-f]{4,4}$/i.test(str)

export const isPortWithinRange = (str: string): boolean =>
  parseInt(str, 10) <= 65535

export const isRelaxedIp6OrMacForm = (str: string): boolean =>
  /^(([0-9a-f]*:){3,}[0-9a-f]*|([0-9a-f]*:){2,}[0-9a-f]*(\.\d+)*)$/i.test(str)

// Look for values like: [12]3.[12]3.[12]3, [12]3.[12]3.[12]3.[12]3.[12]3.
export const isRelaxedIpForm = (str: string): boolean =>
  /^(\d+\.){2,}(\d|\.)*$/.test(str)

export const isValidIP4 = (str: string): boolean => {
  const split = str.split('.')
  return (
    split.length === 4 &&
    split.every(part => {
      if (part) {
        const p = parseInt(part, 10)
        return p >= 0 && p < 256
      }
      return false
    })
  )
}

export const isValidIP6 = (str: string): boolean => {
  const split = str.split(':')
  let emptyPart = false // if we have a "::" then we won't need exactly 8 parts
  const partsAreValid =
    split.length <= 8 &&
    split.every((part, i) => {
      if (part) {
        if (i === split.length - 1 && isValidIP4(part)) {
          return true
        }
        if (part.split('.').length > 1) {
          // do not allow dots in no IP4 parts
          return false
        }
        const p = parseInt(part, 16)
        return p >= 0 && p <= 65535
      }
      if (i > 0 && i < split.length - 1) {
        if (emptyPart) {
          // two empty parts are not allowed
          return false
        }
        emptyPart = true
      }
      return true
    })
  return partsAreValid && (emptyPart || split.length === 8)
}

/**
 * Determines whether the provided string correspond to a mac address eui48
 * Valid formats are: aa:aa:aa:aa:aa:aa, aa-aa-aa-aa-aa-aa and  aaaa.aaaa.aaaa
 * @param {byte array} A mac address in a form of a byte array of 16 octecs.
 * @return {boolean}
 */
export const isValidLegacyMac = (str: string): boolean =>
  /^[0-9a-f]{1,2}((:[0-9a-f]{1,2}){5}|(-[0-9a-f]{1,2}){5}|[0-9a-f]{2}(\.[0-9a-f]{4}){2})$/i.test(
    str,
  )
