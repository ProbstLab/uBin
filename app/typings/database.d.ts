declare module 'database' {
  import {Connection} from 'typeorm'

  interface IDatabase {
    id: string
    connection?: Connection
    samplesPending: boolean
    taxonomiesPending: boolean
    savingBinState?: string
    deletingBinState?: string
    deletingRecordState?: string
  }
}