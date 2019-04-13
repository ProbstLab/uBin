
export function normaliseArray<T>(array: Array<T>|undefined, indexKey: keyof T) {
  if (array === undefined) {return {}}
  const normalisedObject: any = {}
  for (let i = 0; i < array.length; i++) {
    const key = array[i][indexKey]
    normalisedObject[key] = array[i]
  }
  return normalisedObject as { [key: string]: T }
}