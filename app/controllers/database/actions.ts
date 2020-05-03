import {
  dbActions,
  IConnectDatabase,
  IConnectDatabaseFulfilled,
  IGetAllEnzymeTypes,
  IGetBins,
  IGetEnzymeDistribution,
  IGetEnzymeDistributionPending,
  IGetImports,
  IGetSamples,
  IGetSamplesPending,
  IGetSamplesPendingDone,
  IGetTaxonomiesForImport,
  IGetTaxonomiesForImportPending,
  IGetTaxonomiesForImportPendingDone,
  IGetSamplesForBin,
  IGetTaxonomies,
  IGetTaxonomiesPending,
  IGetTaxonomiesPendingDone,
  ISaveBin,
  ISetSaveBinPending,
  ISetSaveBinRejected,
  ISetSaveBinFulfilled,
  ISetDeleteBinPending,
  ISetDeleteBinRejected, ISetDeleteBinFulfilled, IDeleteBin,
  ISetDeleteRecordPending, ISetDeleteRecordRejected, ISetDeleteRecordFulfilled, IDeleteRecord
} from './interfaces'
import {Connection} from 'typeorm'
import {ThunkAction, ThunkDispatch} from 'redux-thunk'
import {AnyAction} from 'redux'
import {getDBConnection} from './selectors'
import {IClientState} from '../index'
import {
  getAllEnzymeTypesQuery,
  getBinsQuery,
  getEnzymeDistributionQuery,
  getSamplesForBinQuery,
  getSamplesQuery,
  getTaxonomiesAndCountQuery,
  getAllTaxonomiesQuery, saveBinQuery, deleteBinQuery,
  deleteRecordQuery
} from './queries'
import {SamplesActions} from '../samples'
import {ISampleFilter} from 'samples'
import {Bin} from '../../db/entities/Bin'
import {createConnection} from 'typeorm'
import {Sample} from "../../db/entities/Sample";
import {Taxonomy} from "../../db/entities/Taxonomy";
import {Enzyme} from "../../db/entities/Enzyme";
import {ImportRecord} from "../../db/entities/ImportRecord";
import {ImportFile} from "../../db/entities/ImportFile";
import {remote} from 'electron'
import { IImportRecord } from 'app/utils/interfaces'


export class DBActions {
  static connectDatabase(): IConnectDatabase {
    return {
      type: dbActions.connectDatabase, payload: createConnection({
        type: 'sqlite',
        database: `${remote.app.getPath('appData')}/database.sqlite`,
        synchronize: true,
        logging: false,
        entities: [Sample, Bin, Taxonomy, Enzyme, ImportRecord, ImportFile],
      })
    }
  }

  static connectDatabaseFulfilled(connection: Connection): IConnectDatabaseFulfilled {
    return {type: dbActions.connectDatabaseFulfilled, payload: connection}
  }

  static getTaxonomiesForImport(connection: Connection, recordId: number, filter?: ISampleFilter): IGetTaxonomiesForImport {
    return {type: dbActions.getTaxonomiesForImport, payload: getTaxonomiesAndCountQuery(connection, recordId, filter)}
  }
  static getTaxonomiesForImportPending(payload: any): IGetTaxonomiesForImportPending {
    return {type: dbActions.getTaxonomiesForImportPending, taxonomiesPending: true}
  }
  static getTaxonomiesForImportPendingDone(): IGetTaxonomiesForImportPendingDone {
    return {type: dbActions.getTaxonomiesForImportPendingDone, taxonomiesPending: false}
  }
  
  static getTaxonomies(connection: Connection, recordId: number, filter?: ISampleFilter): IGetTaxonomies {
    return {type: dbActions.getTaxonomies, payload: getAllTaxonomiesQuery(connection)}
  }
  static getTaxonomiesPending(payload: any): IGetTaxonomiesPending {
    return {type: dbActions.getTaxonomiesPending, taxonomiesPending: true}
  }
  static getTaxonomiesPendingDone(): IGetTaxonomiesPendingDone {
    return {type: dbActions.getTaxonomiesPendingDone, taxonomiesPending: false}
  }

  static getEnzymeDistribution(connection: Connection, recordId: number, taxonomyId?: number[], filter?: ISampleFilter): IGetEnzymeDistribution {
    return {type: dbActions.getEnzymeDistribution, payload: getEnzymeDistributionQuery(connection, recordId, taxonomyId, filter)}
  }
  static getEnzymeDistributionPending(payload: any): IGetEnzymeDistributionPending {
    return {type: dbActions.getEnzymeDistributionPending, enzymeDistributionPending: true}
  }

  static getAllEnzymeTypes(connection: Connection): IGetAllEnzymeTypes {
    return {type: dbActions.getAllEnzymeTypes, payload: getAllEnzymeTypesQuery(connection)}
  }

  static getBins(connection: Connection, recordId: number): IGetBins {
    return {type: dbActions.getBins, payload: getBinsQuery(connection, recordId)}
  }
  static getSamples(connection: Connection, recordId: number, filter?: ISampleFilter): IGetSamples {
    return {type: dbActions.getSamples, payload: getSamplesQuery(connection, recordId, filter)}
  }
  static getSamplesForBin(connection: Connection, recordId: number, binId: number): IGetSamplesForBin {
    return {type: dbActions.getSamplesForBin, payload: getSamplesForBinQuery(connection, recordId, binId)}
  }
  // TODO: Maybe combine both cases
  static getSamplesPending(payload: any): IGetSamplesPending {
    return {type: dbActions.getSamplesPending, samplesPending: true}
  }
  static getSamplesPendingDone(): IGetSamplesPendingDone {
    return {type: dbActions.getSamplesPendingDone, samplesPending: false}
  }

  static getImports(connection: Connection): IGetImports {
    return {type: dbActions.getImports, payload: connection.getRepository(ImportRecord).find()}
  }

  static saveBin(connection: Connection, recordId: number, data: any[], filters: ISampleFilter,
                 name: {covAvg?: number, gcAvg?: number, consensusName?: string, sampleName?: string},
                 dispatch?: ThunkDispatch<{}, {}, AnyAction>): ISaveBin {
    return {type: dbActions.saveBin, payload: saveBinQuery(connection, recordId, data, filters, name, dispatch)}
  }
  static saveBinPending(payload: any): ISetSaveBinPending{
    return {type: dbActions.saveBinPending, payload}
  }
  static saveBinRejected(payload: any): ISetSaveBinRejected{
    return {type: dbActions.saveBinRejected, payload}
  }
  static saveBinFulfilled(payload: any): ISetSaveBinFulfilled{
    return {type: dbActions.saveBinFulfilled, payload}
  }
  
  static deleteBin(connection: Connection, bin: Bin, dispatch?: ThunkDispatch<{}, {}, AnyAction>): IDeleteBin {
    return {type: dbActions.deleteBin, payload: deleteBinQuery(connection, bin)}
  }
  static deleteBinPending(payload: any): ISetDeleteBinPending{
    return {type: dbActions.deleteBinPending, payload}
  }
  static deleteBinRejected(payload: any): ISetDeleteBinRejected{
    return {type: dbActions.deleteBinRejected, payload}
  }
  static deleteBinFulfilled(payload: any): ISetDeleteBinFulfilled{
    return {type: dbActions.deleteBinFulfilled, payload}
  }
  
  static deleteRecord(connection: Connection, record: IImportRecord, dispatch?: ThunkDispatch<{}, {}, AnyAction>): IDeleteRecord {
    return {type: dbActions.deleteRecord, payload: deleteRecordQuery(connection, record)}
  }
  static deleteRecordPending(payload: any): ISetDeleteRecordPending{
    return {type: dbActions.deleteRecordPending, payload}
  }
  static deleteRecordRejected(payload: any): ISetDeleteRecordRejected{
    return {type: dbActions.deleteRecordRejected, payload}
  }
  static deleteRecordFulfilled(payload: any): ISetDeleteRecordFulfilled{
    return {type: dbActions.deleteRecordFulfilled, payload}
  }

  static startDatabase(): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>((resolve) => {
        let connection: (Connection | undefined) = getDBConnection(getState())
        if (!connection) {
          dispatch(DBActions.connectDatabase())
        }
        setTimeout(() => {
          connection = getDBConnection(getState())
          if (connection) {
            dispatch(DBActions.getImports(connection))
            resolve()
          }
        }, 2000)
      })
    }
  }

  static getImportData(recordId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection: Connection | undefined = getDBConnection(getState())
        let filters: ISampleFilter = getState().samples.filters
        if (connection) {
          Promise.all([
            // dispatch(DBActions.getTaxonomiesForImport(connection, recordId, filters)),
            dispatch(DBActions.getTaxonomies(connection, recordId, filters)),
            dispatch(DBActions.getAllEnzymeTypes(connection)),
            dispatch(DBActions.getBins(connection, recordId)),
            dispatch(DBActions.getSamples(connection, recordId, filters)),
            dispatch(SamplesActions.setImportedRecord(recordId)),
            // dispatch(SamplesActions.resetFilters()),
          ]).then(() =>
              Promise.all([dispatch(DBActions.setImportDataFinished())]).then(() => resolve()))
        } else {
          Promise.all([DBActions.setImportDataFinished()]).then(() => resolve())
        }
      })
    }
  }

  static setImportDataFinished(): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        Promise.all([
          dispatch(DBActions.getSamplesPendingDone()),
          dispatch(DBActions.getTaxonomiesForImportPendingDone()),
        ]).then(() => resolve())
      })
    }
  }

  static refreshImports(): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection: Connection | undefined = getDBConnection(getState())
        if (connection) {
          Promise.all([
            dispatch(DBActions.getImports(connection)),
          ]).then(() => resolve())
        } else {
          resolve()
        }
      })
    }
  }
}
