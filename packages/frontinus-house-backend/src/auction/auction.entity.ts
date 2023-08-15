import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Community } from '../community/community.entity';
import { Proposal } from '../proposal/proposal.entity';
import {
  AfterLoad,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { AuctionBase } from './auction-base.type';
import { ApiProperty } from '@nestjs/swagger';
import { AuctionVisibleStatus } from '@nouns/frontinus-house-wrapper';
import { Exclude } from 'class-transformer';

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

  @ApiProperty({
    type: Number,
    description: 'The number of proposals related to the auction',
  })
  @Exclude()
  // This attribute was previously defined in the API layer, which is quite strange - -
  numProposals: number;

  @ApiProperty({ type: () => Community, isArray: true })
  @ManyToOne(() => Community, (community) => community.auctions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => Community)
  community: Community;

  @ApiProperty()
  @CreateDateColumn()
  @Field(() => Date)
  createdDate: Date;

  @ApiProperty()
  @UpdateDateColumn({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ApiProperty()
  @Column({ default: 0 })
  @Field(() => String)
  balanceBlockTag: number;

  @ApiProperty()
  @Column({
    type: 'int',
    enum: AuctionVisibleStatus,
    default: AuctionVisibleStatus.NORMAL,
    comment: '0 means pending, 1 means normal',
  })
  visibleStatus: AuctionVisibleStatus;

  public isAcceptingProposals = (): boolean =>
    new Date() > this.startTime &&
    new Date() <= this.proposalEndTime &&
    this.visibleStatus == AuctionVisibleStatus.NORMAL;

  @AfterLoad()
  public countProposals() {
    if (this.proposalIds && this.proposalIds.length > 0) {
      this.numProposals = this.proposalIds.length;
    } else if (this.proposals) {
      this.numProposals = this.proposals.length;
    } else {
      this.numProposals = 0;
    }
  }
}

@InputType()
export class AuctionInput extends Auction {}
