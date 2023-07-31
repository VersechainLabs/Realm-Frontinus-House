import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Snapshot {
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All snapshots are issued a unique ID number',
  })
  id: number;

  @Column({
    comment:
      'communityAddress in communities, used to confirm the voting power strategy',
  })
  @Field(() => String)
  communityAddress: string;

  @Column()
  @Field(() => Int)
  blockNum: number;

  @Column()
  @Field(() => String)
  address: string;

  @Column()
  @Field(() => Int)
  votingPower: number;

  @Column()
  @Field(() => Date)
  createdDate: Date;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }
}
