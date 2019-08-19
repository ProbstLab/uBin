
export interface IFastaDict {
  [key: string]: IFastaItem
}

export interface IFastaItem {
  content: string
  originalKey: string
}