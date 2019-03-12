declare module 'database' {
  import {Connection} from 'typeorm'

  interface IDatabase {
    id: string
    connection?: Connection
    importsPending: boolean
    samplesPending: boolean
    taxonomiesPending: boolean
  }
}