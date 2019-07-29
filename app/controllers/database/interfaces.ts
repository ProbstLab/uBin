import { IDatabase } from 'database'
import {Action} from "redux"
import {Connection} from "typeorm";

export interface IDBState extends IDatabase {}

export enum dbActions {
  connectDatabase = 'database.connect',
  connectDatabasePending = 'database.connect_PENDING',
  connectDatabaseFulfilled = 'database.connect_FULFILLED',
  getImports = 'database.getImports',
  getTaxonomiesForImport = 'database.getTaxonomiesForImport',
  getTaxonomiesForImportPending = 'database.getTaxonomiesForImport_PENDING',
  getTaxonomiesForImportPendingDone = 'database.getTaxonomiesForImport_PENDING_DONE',
  getTaxonomies = 'database.getTaxonomies',
  getTaxonomiesPending = 'database.getTaxonomies_PENDING',
  getTaxonomiesPendingDone = 'database.getTaxonomies_PENDING_DONE',
  getEnzymeDistribution = 'database.getEnzymeDistribution',
  getEnzymeDistributionPending = 'database.getEnzymeDistribution_PENDING',
  getAllEnzymeTypes = 'database.getAllEnzymeTypes',
  getSamples = 'database.getSamples',
  getSamplesPending = 'database.getSamples_PENDING',
  getSamplesPendingDone = 'database.getSamples_PENDING_DONE',
  getBins = 'database.getBins',
  getBinsPending = 'database.getBins_PENDING',
  getSamplesForBin = 'database.getSamplesForBin',
  saveBin = 'database.saveBin',
  saveBinPending = 'database.saveBin_PENDING',
  saveBinRejected = 'database.saveBin_REJECTED',
  saveBinFulfilled = 'database.saveBin_FULFILLED',
  deleteBin = 'database.deleteBin',
  deleteBinPending = 'database.deleteBin_PENDING',
  deleteBinRejected = 'database.deleteBin_REJECTED',
  deleteBinFulfilled = 'database.deleteBin_FULFILLED',
}

export interface IConnectDatabase extends Action {
  type: dbActions.connectDatabase
  payload: Promise<Connection>
}
export interface IConnectDatabaseFulfilled extends Action {
  type: dbActions.connectDatabaseFulfilled
  payload: Connection
}

export interface IGetTaxonomiesForImport extends Action {
  type: dbActions.getTaxonomiesForImport
  payload: Promise<any>
}
export interface IGetTaxonomiesForImportPending extends Action {
  type: dbActions.getTaxonomiesForImportPending
  taxonomiesPending: boolean
}
export interface IGetTaxonomiesForImportPendingDone extends Action {
  type: dbActions.getTaxonomiesForImportPendingDone
  taxonomiesPending: boolean
}

export interface IGetTaxonomies extends Action {
  type: dbActions.getTaxonomies
  payload: Promise<any>
}
export interface IGetTaxonomiesPending extends Action {
  type: dbActions.getTaxonomiesPending
  taxonomiesPending: boolean
}
export interface IGetTaxonomiesPendingDone extends Action {
  type: dbActions.getTaxonomiesPendingDone
  taxonomiesPending: boolean
}

export interface IGetEnzymeDistribution extends Action {
  type: dbActions.getEnzymeDistribution
  payload: Promise<any>
}
export interface IGetEnzymeDistributionPending extends Action {
  type: dbActions.getEnzymeDistributionPending
  enzymeDistributionPending: boolean
}

export interface IGetAllEnzymeTypes extends Action {
  type: dbActions.getAllEnzymeTypes
  payload: Promise<any>
}

export interface IGetSamples extends Action {
  type: dbActions.getSamples
  payload: Promise<any>
}
export interface IGetSamplesPending extends Action {
  type: dbActions.getSamplesPending
  samplesPending: boolean
}
export interface IGetSamplesPendingDone extends Action {
  type: dbActions.getSamplesPendingDone
  samplesPending: boolean
}

export interface IGetImports extends Action {
  type: dbActions.getImports
  payload: Promise<any>
}

export interface IGetBins extends Action {
  type: dbActions.getBins
  payload: Promise<any>
}
export interface IGetSamplesForBin extends Action {
  type: dbActions.getSamplesForBin
  payload: Promise<any>
}
export interface ISaveBin extends Action {
  type: dbActions.saveBin
  payload: Promise<any>
}
export interface ISetSaveBinPending extends Action {
  type: dbActions.saveBinPending
  payload: any
}
export interface ISetSaveBinRejected extends Action {
  type: dbActions.saveBinRejected
  payload: any
}
export interface ISetSaveBinFulfilled extends Action {
  type: dbActions.saveBinFulfilled
  payload: any
}

export interface IDeleteBin extends Action {
  type: dbActions.deleteBin
  payload: Promise<any>
}
export interface ISetDeleteBinPending extends Action {
  type: dbActions.deleteBinPending
  payload: any
}
export interface ISetDeleteBinRejected extends Action {
  type: dbActions.deleteBinRejected
  payload: any
}
export interface ISetDeleteBinFulfilled extends Action {
  type: dbActions.deleteBinFulfilled
  payload: any
}