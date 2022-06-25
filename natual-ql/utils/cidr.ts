import { SLASH } from '../constants/symbol'
import { isMacAddress, isValidIP4, isValidIP6 } from '../validators/net'
import { convertToCidrFormat } from './net'

export const isCidrBits = (str: string, max: number): boolean => {
  const bits = parseInt(str, 10)
  return bits >= 0 && (!max || bits <= max)
}

export const isIpAddressInCidr = (str: string, strict: boolean | undefined = undefined) => {
  const splitAddress = convertToCidrFormat(str).split(SLASH);
  if (splitAddress.length !== 2 || !isCidrBits(splitAddress[1], strict ? 128 : 0)) {
    return false;
  }

  return isValidIP4(splitAddress[0]) || isValidIP6(splitAddress[0]);
}

export const isMacAddressInCidr = (str: string, strict: boolean | undefined = undefined) => {
  const splitAddress = str.split(SLASH)
  if (
    splitAddress.length !== 2 ||
    !isCidrBits(splitAddress[1], strict ? 64 : 0)
  ) {
    return false
  }

  return isMacAddress(splitAddress[0])
}














/*
import ipaddr from 'ipaddr.js';
export const parseCIDR = (text) => {
  const cidr = convertToCidrFormat(text);
  if (cidr && cidr.includes(SLASH)) {
    try {
      return ipaddr.parseCIDR(cidr);
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
}
*/