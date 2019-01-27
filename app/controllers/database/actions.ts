import {
  dbActions,
  IConnectDatabase,
  IConnectDatabaseFulfilled,
  IGetImports,
  IGetImportsPending,
  IGetTaxonomiesForImport,
} from './interfaces'
import {Connection} from "typeorm";
import {ThunkAction, ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
// import {getDBConnection} from "./selectors";
import {IClientState} from "../index";
import {getTaxonimiesForImportQuery} from "./queries";
import {ipcRenderer} from "electron";

// console.log("window: ", window)
// const orm = (window as any).typeorm

export class DBActions {
  static connectDatabase(connection: Promise<Connection>): IConnectDatabase {
    console.log("connection: ", connection)
    return {
      type: dbActions.connectDatabase, payload: connection
    }
  }
  static connectDatabaseFulfilled(connection: Connection): IConnectDatabaseFulfilled {
    return {type: dbActions.connectDatabaseFulfilled, payload: connection}
  }

  static getTaxonomiesForImport(connection: Connection, recordId: number): IGetTaxonomiesForImport {
    console.log("action for taxonomies")
    return {type: dbActions.getTaxonomiesForImport, payload: getTaxonimiesForImportQuery(connection, recordId)}
  }

  static getImports(connection: Connection): IGetImports {
    return {type: dbActions.getImports, payload: connection.getRepository('import_record').find()}
  }
  static getImportsPending(payload: any): IGetImportsPending {
    return {type: dbActions.getImportsPending, payload}
  }
  static startDatabase(): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    // console.log("ipcrenderer, send!")
    ipcRenderer.send('DB', 'DB_START', {test: "wow"})
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>((resolve) => {
        ipcRenderer.once('DB_CONNECT', (event: any, result: any) => {
          console.log("db connect event", event, result)
          dispatch(DBActions.connectDatabase(result))
        })
        // let connection: (Connection | undefined) = getDBConnection(getState())
        // if (!connection) {
        //   dispatch(DBActions.connectDatabase())
        // }
        // setTimeout(() => {
        //   connection = getDBConnection(getState())
        //   if (connection) {
        //     dispatch(DBActions.getImports(connection))
        //     resolve()
        //   }
        // }, 2000)
      })
    }
  }
}