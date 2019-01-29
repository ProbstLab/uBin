import { IDatabase } from 'database'
import {Action} from "redux";
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

export interface IGetImports extends Action {
  type: dbActions.getImports
  payload: Promise<any>
}
export interface IGetImportsPending extends Action {
  type: dbActions.getImportsPending
  payload: any
}