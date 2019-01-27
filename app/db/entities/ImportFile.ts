import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm'
import {ImportRecord} from "./ImportRecord";

@Entity()
export class ImportFile {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'varchar',
    length: 256,
    unique: true,
  })
  name: string

  @ManyToOne(type => ImportRecord, importRecord => importRecord.files)
  importRecord: ImportRecord
}