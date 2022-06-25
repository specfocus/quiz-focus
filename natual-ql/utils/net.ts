import {
  BYTE_SIZE,
  FE,
  FF,
  HEXADECIMAL,
  IP,
  IPV4,
  LINK_LOCAL_PREFIX,
  MAC,
} from '../constants/net'
import { COLON, DOT, SLASH, WILDCARD } from '../constants/symbol'
import { isValidLegacyMac } from '../validators/net'

export const allDelimiters = new RegExp(`[-${COLON}\\${DOT}]`)

/**
 * Fills a string with zeros on the left side in order to complete the desired size.
 * @param {string} text
 * @param {int} size The target size for the binary string.
 * @returns {string} Returns a byte string (8 bits long)
 */
export const addLeadingZeros = (text, size) => {
  const pad = size - text.length
  return text && pad ? '0'.repeat(pad).concat(text) : text
}

/**
 * Converts a contained Mac to eui48 format. In contained Mac, the first 8 bytes are ignored, from
 * the remaining bytes the 3rd and 4th are also ignored.
 * @param {array} byteArray Mac address in the form of a byte array.
 */
export const containedMacArrayToEui48 = byteArray => {
  const newMac = byteArray
    .slice(8)
    .reduce(
      (acc, curr, index) =>
        index !== 3 && index !== 4
          ? acc.concat(curr.toString(HEXADECIMAL))
          : acc,
      [],
    )
  newMac[0] = toggleUBit(newMac[0])
  return newMac.map(octec => addLeadingZeros(octec.toString(), 2)).join(COLON)
}

/**
 * Converts a given IP using wildcards to a CIDR format. Supported formats are:
 * n.n.n.* converts to n.n.n.0/24
 * n.n.* or n.n.*.* converts to n.n.0.0/16
 * n.* or n.*.* or n.*.*.* converts to n.0.0.0/8
 * @param {string} ip The IP in any of the supported formats
 * @returns {string} Returns the IP in CIDR format
 */
export const convertToCidrFormat = ip => {
  const IPBYTES = 4
  if (isIpWithWildCards(ip)) {
    let maskBits = 0
    const ipArray = ip.split(DOT).map((part, i) => {
      if (part === WILDCARD) {
        if (maskBits === 0 && i > 0) {
          maskBits = (IPBYTES - i) * BYTE_SIZE
        }
        return '0'
      }
      return part
    })
    while (ipArray.length < IPBYTES) {
      ipArray.push('0')
    }

    return ipArray
      .join(DOT)
      .concat(SLASH)
      .concat(32 - maskBits)
  }
  return ip
}

export const getDelimiter = text => {
  const matches = text.match(allDelimiters)
  return matches ? matches[0] : undefined
}

export const getPrefixedBitsByType = type => {
  switch (type) {
    case IPV4:
    case IP:
      return 96
    case MAC:
      return 64
    default:
      return 0
  }
}

/**
 * Determines whether the provided byte array correspond to a mac address with the link local prefix
 * @param {byte array} A mac address in a form of a byte array of 16 octecs.
 * @return {boolean}
 */
export const isContainedMac = (byteArray: number[]): boolean =>
  byteArray[0] === 254 &&
  byteArray[1] === 128 &&
  ![2, 3, 4, 5, 6, 7].some(index => byteArray[index] !== 0)

export const macIpv6ToLegacyMac = ipAddress => {
  const byteArray = ipAddress.toByteArray()
  return isContainedMac(byteArray)
    ? containedMacArrayToEui48(byteArray)
    : ipAddress.toString()
}

// Looks for: n.*, n.n.*, n.n.n.*, n.*.*.*
export const isIpWithWildCards = (str: string): boolean =>
  /^(\d+){1}(\.(\d+|\*)){0,2}(\.\*)$/.test(str)

export const legacyMacToIpv6 = legacyMac => {
  const splitAddress = (legacyMac ? legacyMac.trim() : '').split(SLASH)
  if (splitAddress[0] && isValidLegacyMac(splitAddress[0])) {
    const delimiter = getDelimiter(splitAddress[0])
    let eui64 = splitAddress[0].split(delimiter)
    switch (eui64.length) {
      case 4:
      case 6:
        break
      case 3:
        // convert from [a]aaa.aaaa.aaaa
        eui64 = toSixOctecsMac(splitAddress[0], delimiter, 14)
        break
      default:
        return splitAddress[0]
    }
    eui64.splice(3, 0, FF, FE)
    eui64[0] = toggleUBit(eui64[0])

    return LINK_LOCAL_PREFIX.concat(
      eui64.reduce(
        (acc, curr, idx) =>
          idx % 2 === 0 ? acc.concat(COLON).concat(curr) : acc.concat(curr),
        '',
      ),
    ).concat(splitAddress[1] ? `/${splitAddress[1]}` : '')
  }
  return legacyMac
}

/**
 * Converts a decimal number to a 8 bit string
 * @param {decimal} decimal
 */
export const toCompleteByteString = (decimal: number) =>
  addLeadingZeros(decimal.toString(2), BYTE_SIZE)

/**
 * Inverts the U bit (seventh bit) of a given hexadecimal octec.
 * @param {hexadecimal} octec An hexadecimal octec (8 bits long)
 * @returns {hexadecimal} Returns the hexadecimal octec but with its 7th bit inverted.
 */
export const toggleUBit = (octec: string) => {
  const bitArray: number[] = Array.from(
    toCompleteByteString(parseInt(octec, HEXADECIMAL)),
  )
  const uBitIndex = bitArray.length - 2
  bitArray[uBitIndex] = 1 - bitArray[uBitIndex]
  return parseInt(bitArray.join(''), 2).toString(HEXADECIMAL)
}

export const toSixOctecsMac = (legacyMac, delimiter, fullAddressSize) => {
  const replaceRegex = new RegExp(`\\${delimiter}`, 'g')
  const fixedMac =
    legacyMac.length === fullAddressSize - 1 ? '0'.concat(legacyMac) : legacyMac
  return fixedMac.replace(replaceRegex, '').match(/.{2}/g)
}
