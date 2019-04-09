import { Action } from 'redux'
// import { IValueMap } from 'common'
// import { ISample } from 'samples'
import {ITaxonomyForSunburst} from '../../utils/interfaces'
import {Enzyme} from '../../db/entities/Enzyme'
import {ISampleFilter, IDomain} from 'samples'
import {Bin} from '../../db/entities/Bin'
import {Taxonomy} from '../../db/entities/Taxonomy'

export interface IImportRecord {
  id: number
  name: string
}

export interface ISamplesState {
  filters: ISampleFilter
  samples?: any[]
  importRecords: IImportRecord[]
  taxonomies?: Taxonomy[]
  enzymeDistribution?: Enzyme[]
  enzymeTypes?: Enzyme[]
  selectedTaxonomy?: ITaxonomyForSunburst
  recordId?: number
  bins: Bin[]
  importRecordsPending: boolean
  importsLoaded: boolean
  consensus?: Taxonomy
  consensusName?: string
  sampleName?: string
  gcAvg?: number
  coverageAvg?: number
  savingBins?: boolean
}

export enum samplesActions {
  getImportsPending = 'database.getImports_PENDING',
  getImportsFulfilled = 'database.getImports_FULFILLED',
  getTaxonomiesFulfilled = 'database.getTaxonomies_FULFILLED',
  getTaxonomiesForImportFulfilled = 'database.getTaxonomiesForImport_FULFILLED',
  getEnzymeDistributionFulfilled = 'database.getEnzymeDistribution_FULFILLED',
  getAllEnzymeTypesFulfilled = 'database.getAllEnzymeTypes_FULFILLED',
  getSamplesFulfilled = 'database.getSamples_FULFILLED',
  getBinsFulfilled = 'database.getBins_FULFILLED',
  setImportedRecord = 'database.setImportedRecord',
  setDomain = 'samples.setDomain',
  setDomainX = 'samples.setDomainX',
  setDomainY = 'samples.setDomainY',
  setSelectedTaxonomy = 'samples.setSelectedTaxonomy',
  addExcludedTaxonomy = 'samples.addExcludedTaxonomy',
  removeFilters = 'samples.removeFilters',
  resetDomain = 'samples.resetDomain',
  resetGC = 'samples.resetGC',
  resetCoverage = 'samples.resetCoverage',
  resetTaxonomies = 'samples.resetTaxonomies',
  resetBin = 'samples.resetBin',
  setBinFilter = 'samples.setBinFilter',
  setBinView = 'samples.setBinView',
  setConsensus = 'samples.setConsensus',
  setConsensusName = 'samples.setConsensusName',
  setSampleName = 'samples.setSampleName',
  setGCAverage = 'samples.setGCAverage',
  setCoverageAverage = 'samples.setCoverageAverage',
  setSavingBins = 'samples.setSavingBins',
}
export interface IGetImportsPending extends Action {
  type: samplesActions.getImportsPending
  payload: any
}
export interface IGetImportsFulfilled extends Action {
  type: samplesActions.getImportsFulfilled
  payload: any
}

export interface IGetTaxonomiesForImportFulfilled extends Action {
  type: samplesActions.getTaxonomiesForImportFulfilled
  payload: any
}
export interface IGetTaxonomiesFulfilled extends Action {
  type: samplesActions.getTaxonomiesFulfilled
  payload: any
}
export interface IGetEnzymeDistributionFulfilled extends Action {
  type: samplesActions.getEnzymeDistributionFulfilled
  payload: any
}
export interface IGetAllEnzymeTypesFulfilled extends Action {
  type: samplesActions.getAllEnzymeTypesFulfilled
  payload: any
}
export interface IGetSamplesFulfilled extends Action {
  type: samplesActions.getSamplesFulfilled
  payload: any
}
export interface IGetBinsFulfilled extends Action {
  type: samplesActions.getBinsFulfilled
  payload: any
}

export interface IRemoveFilters extends Action {
  type: samplesActions.removeFilters
}
export interface IResetDomain extends Action {
  type: samplesActions.resetDomain
}
export interface IResetGC extends Action {
  type: samplesActions.resetGC
}
export interface IResetCoverage extends Action {
  type: samplesActions.resetCoverage
}
export interface IResetTaxonomies extends Action {
  type: samplesActions.resetTaxonomies
}
export interface IResetBin extends Action {
  type: samplesActions.resetBin
}

export interface ISetImportedRecord extends Action {
  type: samplesActions.setImportedRecord
  recordId: number
}
export interface ISetSelectedTaxonomy extends Action {
  type: samplesActions.setSelectedTaxonomy
  taxonomy: Taxonomy
}
export interface IAddExcludedTaxonomy extends Action {
  type: samplesActions.addExcludedTaxonomy
  taxonomy: Taxonomy
}

export interface ISetDomain extends Action {
  type: samplesActions.setDomain
  domain: IDomain
}
export interface ISetDomainX extends Action {
  type: samplesActions.setDomainX
  domain: [number, number]
}
export interface ISetDomainY extends Action {
  type: samplesActions.setDomainY
  domain: [number, number]
}
export interface ISetBinFilter extends Action {
  type: samplesActions.setBinFilter
  bin: Bin
}
export interface ISetBinView extends Action {
  type: samplesActions.setBinView
  binView: boolean
}

export interface ISetConsensus extends Action {
  type: samplesActions.setConsensus
  consensus: Taxonomy
}
export interface ISetConsensusName extends Action {
  type: samplesActions.setConsensusName
  consensusName: string
}
export interface ISetSampleName extends Action {
  type: samplesActions.setSampleName
  sampleName: string
}
export interface ISetGCAverage extends Action {
  type: samplesActions.setGCAverage
  avg: number
}
export interface ISetCoverageAverage extends Action {
  type: samplesActions.setCoverageAverage
  avg: number
}

export interface ISetSavingBins extends Action {
  type: samplesActions.setSavingBins
  saving: boolean
}