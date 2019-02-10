import { Action } from 'redux'
// import { IValueMap } from 'common'
// import { ISample } from 'samples'
import {IGenericAssociativeArray, ITaxonomyForSunburst} from '../../utils/interfaces'
import {Enzyme} from '../../db/entities/Enzyme'
import {ISampleFilter, IScatterDomain} from 'samples'

export interface IImportRecord {
  id: number
  name: string
}

export interface ISamplesState {
  filters: ISampleFilter
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
  setScatterDomain = 'samples.setScatterDomain',
  setTaxonomyIds = 'samples.setTaxonomyIds',
  removeFilters = 'samples.removeFilters',
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
export interface IRemoveFilters extends Action {
  type: samplesActions.removeFilters
}
export interface ISetImportedRecord extends Action {
  type: samplesActions.setImportedRecord
  recordId: number
}
export interface ISetTaxonomyIds extends Action {
  type: samplesActions.setTaxonomyIds
  taxonomyIds: number[]
}
export interface ISetScatterDomain extends Action {
  type: samplesActions.setScatterDomain
  scatterDomain: IScatterDomain
}
