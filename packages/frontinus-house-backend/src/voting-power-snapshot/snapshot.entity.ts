import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Community } from 'src/community/community.entity';
import { Application } from 'src/delegation-application/application.entity';
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
export class Snapshot {
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All snapshots are issued a unique ID number',
  })
  id: number;

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


  //   public isAcceptingProposals = (): boolean =>
  //     new Date() > this.startTime && new Date() <= this.proposalEndTime;
}

// @InputType()
// export class AuctionInput extends Auction {}
