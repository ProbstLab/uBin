// import {Connection} from "typeorm";
import {Connection, createConnection} from 'typeorm'

export class DB {
  static test(): string {
    return "Hello world!"
  }
  static connect(): Promise<Connection> {
    return createConnection({
      type: "sqlite",
      database: `${require('os').homedir()}/database.sqlite`
    })
  }
}

// console.log('db.js __dirname', __dirname);

