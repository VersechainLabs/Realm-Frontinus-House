import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
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

  //   public isAcceptingProposals = (): boolean =>
  //     new Date() > this.startTime && new Date() <= this.proposalEndTime;
}

// @InputType()
// export class AuctionInput extends Auction {}
