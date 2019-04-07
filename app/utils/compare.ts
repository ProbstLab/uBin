export const compareArrayToString = (val: string, arr: string[]): boolean => {
  for (let i: number = 0; i < arr.length; i++) {
    if (val.indexOf(arr[i]) >= 0) {
      return true
    }
  }
  return false
}