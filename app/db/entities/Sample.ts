import {Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, ManyToOne, Unique} from 'typeorm'
import {Taxonomy} from './Taxonomy'
import {Enzyme} from './Enzyme'
import {ImportRecord} from './ImportRecord'

@Entity()
@Unique(['scaffold', 'importRecord'])
export class Sample {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'varchar',
    length: 256
  })
  scaffold: string

  @Column('double')
  gc: number

  @Column('integer')
  coverage: number

  @Column('integer')
  length: number

  @ManyToOne(type => Taxonomy, taxonomy => taxonomy.samples)
  @JoinTable()
  taxonomy: Taxonomy

  @ManyToMany(type => Enzyme, enzyme => enzyme.samples)
  @JoinTable()
  enzymes: Enzyme[]

  @ManyToOne(type => ImportRecord, importRecord => importRecord.samples)
  @JoinTable()
  importRecord: ImportRecord
}