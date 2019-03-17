
export interface IIdType {
  id: number
}

export interface IImportFile {
  id?: number
  name: string
}

export interface IImportRecord {
  id?: number
  name: string
  files: IImportFile[]
}

export interface IBin {
  id?: number,
  name: string,
  importRecord: number | IImportRecord
}

export interface IEnzyme {
  id?: number,
  name: string,
  bacterial: boolean,
  archaeal: boolean,
}

export interface ITaxonomy {
  id?: number
  name: string
  order: number
  children: IGenericAssociativeArray
  parent?: ITaxonomy | number
  occurrences?: number
}

export interface ITaxonomyForSunburst {
  id?: number
  name: string
  order: number
  children?: ITaxonomyForSunburst[]
  value?: number
}

export interface ISample {
  id?: number
  scaffold: string
  coverage: number
  gc: number
  length: number
  taxonomy?: (number | ITaxonomy | IdValuePair)[] | IdValuePair
  taxonomyKeys: string[]
  enzymes?: (number | IEnzyme | IdValuePair)[]
  enzymeKeys: number[]
  importRecord?: IImportRecord
  binName?: string
  bin?: number | IBin
}

export interface IdValuePair {
  id?: number | string
}

export interface IDynamicAssociativeArray {
  [key: string]: ITaxonomy | IEnzyme | ISample | IBin
}

export interface ITaxonomyAssociativeArray {
  [key: string]: ITaxonomy
}

export interface IGenericAssociativeArray {
  [key: string]: any
}

export interface IBarData {
  name: string | number
  amount: number
  [key: string]: string | number
}