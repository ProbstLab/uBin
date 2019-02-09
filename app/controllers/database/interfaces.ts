import { IDatabase } from 'database'
import {Action} from "redux"
import {Connection} from "typeorm";

export interface IDBState extends IDatabase {}

export enum dbActions {
  connectDatabase = 'database.connect',
  connectDatabasePending = 'database.connect_PENDING',
  connectDatabaseFulfilled = 'database.connect_FULFILLED',
  getImports = 'database.getImports',
  getImportsPending = 'database.getImports_PENDING',
  getTaxonomiesForImport = 'database.getTaxonomiesForImport',
  getTaxonomiesForImportPending = 'database.getTaxonomiesForImport_PENDING',
  getEnzymeDistribution = 'database.getEnzymeDistribution',
  getEnzymeDistributionPending = 'database.getEnzymeDistribution_PENDING',
  getSamples = 'database.getSamples',
  getSamplesPending = 'database.getSamples_PENDING',
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
  importPending: boolean
}

export interface IGetEnzymeDistribution extends Action {
  type: dbActions.getEnzymeDistribution
  payload: Promise<any>
}
export interface IGetEnzymeDistributionPending extends Action {
  type: dbActions.getEnzymeDistributionPending
  enzymeDistributionPending: boolean
}

export interface IGetSamples extends Action {
  type: dbActions.getSamples
  payload: Promise<any>
}
export interface IGetSamplesPending extends Action {
  type: dbActions.getSamplesPending
  samplesPending: boolean
}

export interface IGetImports extends Action {
  type: dbActions.getImports
  payload: Promise<any>
}
export interface IGetImportsPending extends Action {
  type: dbActions.getImportsPending
  payload: any
}