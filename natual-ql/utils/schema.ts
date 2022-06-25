import { defaultColumnRank, defaultGroupnameRank } from '../constants/column'

export const isGroupname = (s) => s.isGroupname // return database.findGroupname(s.field)

export const columnComparer = (s1, s2) => {
  const getRank = (s) => {
    if (typeof s.rank === 'number') {
      return s.rank
    }
    return isGroupname(s) ? defaultGroupnameRank : defaultColumnRank
  }
  const rank1 = getRank(s1)
  const rank2 = getRank(s2)
  if (rank1 === rank2) {
    if (s1.label < s2.label) {
      return -1
    }
    if (s1.label > s2.label) {
      return 1
    }
    return 0
  }
  return rank1 < rank2 ? -1 : 1
}

export const sortColumns = columnsAndGroupnames => columnsAndGroupnames.sort(columnComparer)