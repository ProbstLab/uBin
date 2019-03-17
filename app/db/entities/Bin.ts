import {Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToOne, Unique, OneToMany} from 'typeorm'
import {ImportRecord} from './ImportRecord'
import {Sample} from './Sample'
import {ImportFile} from './ImportFile'

@Entity()
@Unique(['name', 'importRecord'])
export class Bin {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'varchar',
    length: 256,
  })
  name: string

  @ManyToOne(type => ImportRecord, importRecord => importRecord.samples)
  @JoinTable()
  importRecord: ImportRecord

  @OneToMany(type => Sample, sample => sample.bin)
  samples: ImportFile[]
}
