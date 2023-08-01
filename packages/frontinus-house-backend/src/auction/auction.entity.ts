import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Community } from 'src/community/community.entity';
import { Proposal } from 'src/proposal/proposal.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { AuctionBase } from './auction-base.type';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@ObjectType()
export class Auction implements AuctionBase {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All auctions are issued a unique ID number',
  })
  id: number;

  @Column({ default: true })
  visible: boolean;

  @ApiProperty()
  @Column()
  @Field(() => String)
  title: string;

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
  @Column({
    type: 'decimal',
    scale: 2,
    precision: 10,
    default: '0',
  })
  @Field(() => Float, {
    description: 'The number of currency units paid to each winner',
  })
  fundingAmount: number;

  @ApiProperty()
  @Column({ nullable: true })
  @Field(() => String, {
    description: 'The currency for the auction that winners will be paid in',
  })
  currencyType: string;

  @ApiProperty()
  @Column({ nullable: true })
  @Field(() => String)
  description: string;

  @ApiProperty()
  @Column()
  @Field(() => Int, {
    description: 'The number of winners that will be paid from the auction',
  })
  numWinners: number;

  @ApiProperty({ type: () => Proposal, isArray: true })
  @OneToMany(() => Proposal, (proposal) => proposal.auction, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => [Proposal])
  proposals: Proposal[];

  @RelationId((auction: Auction) => auction.proposals)
  proposalIds: number[];

  @ApiProperty({ type: () => Community, isArray: true })
  @ManyToOne(() => Community, (community) => community.auctions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => Community)
  community: Community;

  @ApiProperty()
  @Column()
  @Field(() => Date)
  createdDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @ApiProperty()
  @Column({ default: 0 })
  @Field(() => String)
  balanceBlockTag: number;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  setUpdatedDate() {
    this.lastUpdatedDate = new Date();
  }

  public isAcceptingProposals = (): boolean =>
    new Date() > this.startTime && new Date() <= this.proposalEndTime;
}

@InputType()
export class AuctionInput extends Auction {}
