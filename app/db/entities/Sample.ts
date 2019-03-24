import {Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, ManyToOne, Unique} from 'typeorm'
import {Taxonomy} from './Taxonomy'
import {Enzyme} from './Enzyme'
import {ImportRecord} from './ImportRecord'
import {Bin} from './Bin'

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

  @Column({
    type: 'varchar',
    length: 100,
    default: '',
  })
  taxonomiesRelationString: string

  @ManyToOne(type => Taxonomy, taxonomy => taxonomy.samples)
  @JoinTable()
  taxonomy: Taxonomy

  @ManyToMany(type => Enzyme, enzyme => enzyme.samples)
  @JoinTable()
  enzymes: Enzyme[]

  @ManyToOne(type => Bin, bin => bin.samples)
  @JoinTable()
  bin: Bin

  @ManyToOne(type => ImportRecord, importRecord => importRecord.samples)
  @JoinTable()
  importRecord: ImportRecord
}
