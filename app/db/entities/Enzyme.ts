import {Entity, PrimaryGeneratedColumn, Column, ManyToMany} from 'typeorm'
import {Sample} from "./Sample";

@Entity()
export class Enzyme {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'varchar',
    length: 256,
    unique: true,
  })
  name: string

  @Column({
    type: 'boolean',
    default: false,
  })
  bacterial: boolean

  @Column({
    type: 'boolean',
    default: false,
  })
  archaeal: boolean

  @ManyToMany(type => Sample, sample => sample.enzymes)
  samples: Sample[]

  sampleCount: number
}