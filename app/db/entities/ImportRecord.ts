import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm'
import {ImportFile} from "./ImportFile";
import {Sample} from "./Sample";

@Entity()
export class ImportRecord {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'varchar',
    length: 256,
    unique: true,
  })
  name: string

  @OneToMany(type => ImportFile, file => file.importRecord)
  files: ImportFile[]

  @OneToMany(type => Sample, sample => sample.importRecord)
  samples: ImportFile[]
}