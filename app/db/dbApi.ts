// import {Connection} from "typeorm";
import {Connection, createConnection} from 'typeorm'

export class DB {
  static test(): string {
    return "Hello world!"
  }
  static connect(): Promise<any> {
    return createConnection()
      .then(async (connection: Connection) => {
        console.log("connected:", connection)
        }
      ).catch((error: any) => console.log("error: ", error))
  }
}

// console.log('db.js __dirname', __dirname);

