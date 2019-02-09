import {IGenericAssociativeArray} from './interfaces'

export class KeyValueCreator {
  static createKeyValueObject = (obj: any[], key: string, val: string): IGenericAssociativeArray => {
    let keyValArray: IGenericAssociativeArray = {}
    obj.forEach((item: any): void => {keyValArray[item[key]] = item[val]})
    return keyValArray
  }
}