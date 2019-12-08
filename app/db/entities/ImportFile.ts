import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique} from 'typeorm'
import {ImportRecord} from "./ImportRecord";

@Entity()
@Unique(['name', 'importRecord'])
export class ImportFile {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'varchar',
    length: 256,
    unique: false,
  })
  name: string

  @ManyToOne(type => ImportRecord, importRecord => importRecord.files)
  importRecord: ImportRecord
}
