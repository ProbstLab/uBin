import { Action } from 'redux'
// import { IValueMap } from 'common'
// import { ISample } from 'samples'
import {IGenericAssociativeArray, ITaxonomyForSunburst} from "../../utils/interfaces"
import {Enzyme} from '../../db/entities/Enzyme'

export interface IImportRecord {
  id: number
  name: string
}

export interface ISamplesState {
  samples?: any[]
  importRecords: IImportRecord[]
  taxonomyTreeFull?: IGenericAssociativeArray
  enzymeDistribution?: Enzyme[]
  selectedTaxonomy?: ITaxonomyForSunburst
  recordId?: number
}

export enum samplesActions {
  getImportsFulfilled = 'database.getImports_FULFILLED',
  getTaxonomiesForImportFulfilled = 'database.getTaxonomiesForImport_FULFILLED',
  getEnzymeDistributionFulfilled = 'database.getEnzymeDistribution_FULFILLED',
  getSamplesFulfilled = 'database.getSamples_FULFILLED',
  setImportedRecord = 'database.setImportedRecord',
}
export interface IGetImportsFulfilled extends Action {
  type: samplesActions.getImportsFulfilled
  payload: any
}
export interface IGetTaxonomiesForImportFulfilled extends Action {
  type: samplesActions.getTaxonomiesForImportFulfilled
  payload: any
}
export interface IGetEnzymeDistributionFulfilled extends Action {
  type: samplesActions.getEnzymeDistributionFulfilled
  payload: any
}
export interface IGetSamplesFulfilled extends Action {
  type: samplesActions.getSamplesFulfilled
  payload: any
}
export interface ISetImportedRecord extends Action {
  type: samplesActions.setImportedRecord
  recordId: number
}
