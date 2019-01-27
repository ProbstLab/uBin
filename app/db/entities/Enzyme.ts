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

  @ManyToMany(type => Sample, sample => sample.enzymes)
  samples: Sample[]
}