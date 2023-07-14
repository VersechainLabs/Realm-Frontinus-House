import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Community } from 'src/community/community.entity';
import { Delegate } from 'src/delegate/delegate.entity';
import { Proposal } from 'src/proposal/proposal.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  RelationId,
} from 'typeorm';
// import { AuctionBase } from './auction-base.type';

@Entity()
@ObjectType()
export class Admin {
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All nominees are issued a unique ID number',
  })
  id: number;

  @Column()
  @Field(() => String)
  address: string;

  @Column()
  @Field(() => Date)
  createdDate: Date;

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

// @InputType()
// export class AuctionInput extends Auction {}
