import * as colorConvert from 'color-convert'

export const stringToNumberHash = (val: string): number => {
  let hash: number = 0
  let chr: number
  if (val.length === 0) {
    return hash
  }
  for (let i: number = 0; i < (val.length < 6 ? val.length : 6); i++) {
    chr = val.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return hash
}

export const numToColour = (val: number): string => {
  return colorConvert.hsl.hex([(val*50)%360, 82, 35])
}