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
}

export interface IdValuePair {
  id?: number | string
}

export interface IDynamicAssociativeArray {
  [key: string]: ITaxonomy | IEnzyme | ISample
}

export interface ITaxonomyAssociativeArray {
  [key: string]: ITaxonomy
}

export interface IGenericAssociativeArray {
  [key: string]: any
}

export interface IVisData {
  x: string | number
  y: number
  [key: string]: string | number
}
export interface IVisLabel {
  x: number
  y: number
  label: string
  [key: string]: string | number
}