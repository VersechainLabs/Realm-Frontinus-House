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
export class Delegation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All delegation are issued a unique ID number',
  })
  id: number;

  @Column({ default: true })
  visible: boolean;

  @ApiProperty()
  @Column()
  @Field(() => String)
  title: string;

  @ApiProperty({
    description:
      'This is description of the delegation.',
  })
  @Column({ nullable: true })
  @Field(() => String)
  description: string;

  @ApiProperty({ type: () => Application, isArray: true })
  @OneToMany(() => Application, (application) => application.delegation)
  @JoinColumn()
  @Field(() => [Application])
  applications: Application[];

  @ApiProperty()
  @Column({ type: 'integer', default: 0 })
  @Field(() => Int)
  applicationCount: number;

  @ApiProperty()
  @Column()
  @Field(() => Date, {
    description: 'After the Start Time users may submit proposals',
  })
  startTime: Date;

  @ApiProperty()
  @Column()
  @Field(() => Date, {
    description: 'Users may submit proposals up until Proposal End Time',
  })
  proposalEndTime: Date;

  @ApiProperty()
  @Column()
  @Field(() => Date, {
    description:
      'Between Proposal End Time and Voting End Time, users may submit votes for proposals',
  })
  votingEndTime: Date;

  @ApiProperty()
  @Column()
  @Field(() => Date, {
    description:
      'Between Voting End Time and End Time, delegaters vote for users',
  })
  endTime: Date;

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
