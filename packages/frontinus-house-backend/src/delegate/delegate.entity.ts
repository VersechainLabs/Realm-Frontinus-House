import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// import { AuctionBase } from './auction-base.type';

@Entity()
@ObjectType()
export class Delegate {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All delegates are issued a unique ID number',
  })
  id: number;

  @ApiProperty()
  @Column()
  @Field(() => Int)
  delegationId: number;

  @ApiProperty()
  @Column()
  @Field(() => Int)
  applicationId: number;

  @ApiProperty()
  @Column()
  @Field(() => String)
  fromAddress: string;

  @ApiProperty()
  @Column()
  @Field(() => String)
  toAddress: string;

  @ApiProperty()
  @Column()
  @Field(() => Date)
  createdDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  setUpdatedDate() {
    this.lastUpdatedDate = new Date();
  }
}
