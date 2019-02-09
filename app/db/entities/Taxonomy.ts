import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  JoinTable,
  OneToMany,
} from 'typeorm'
import {Sample} from "./Sample";

@Entity()
@Unique(['order', 'id'])
export class Taxonomy {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
      type: 'tinyint',
      default: 0
  })
  order: number

  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string

  @OneToMany(type => Sample, sample => sample.taxonomy)
  @JoinTable()
  samples: Sample[]

  @ManyToOne(type => Taxonomy, taxonomy => taxonomy.parent)
  @JoinTable()
  parent: Taxonomy

  sampleCount: number
}