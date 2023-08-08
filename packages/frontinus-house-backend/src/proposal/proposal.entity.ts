import { Field, ObjectType } from '@nestjs/graphql';
import { Auction } from '../auction/auction.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { convertVoteListToDelegateVoteList, Vote } from '../vote/vote.entity';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { Address } from '../types/address';
import { ProposalParent } from './proposal.types';
import { Float, Int } from '@nestjs/graphql/dist/scalars';
import { IsEthereumAddress } from 'class-validator';

@Entity('proposal')
@ObjectType()
export class Proposal {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ default: true })
  visible: boolean;

  @ApiProperty()
  @Column()
  @Field(() => String)
  title: string;

  @ApiProperty()
  @Column({ type: 'text' })
  @Field(() => String)
  what: string;

  @ApiProperty()
  @Column({ type: 'text' })
  @Field(() => String)
  tldr: string;

  // AuctionID exists on entities with relations
  @ApiProperty()
  @Column()
  auctionId: number;

  @ApiProperty({ description: 'The signer address' })
  @Column()
  @IsEthereumAddress()
  @Field(() => String)
  address: Address;

  @ApiProperty({ type: () => Vote, isArray: true })
  @OneToMany(() => Vote, (vote) => vote.proposal, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => [Vote])
  votes: Vote[];

  @ApiProperty()
  @Column({ type: 'integer', default: 0 })
  @Field(() => Int)
  voteCount: number;

  @BeforeUpdate()
  updateVoteCount() {
    if (this.votes) {
      this.voteCount = this.votes.reduce((acc, vote) => {
        return Number(acc) + Number(vote.weight);
      }, 0);
    } else {
      this.voteCount = 0;
    }
  }

  @ApiProperty({
    description: 'The comment count about this proposal',
  })
  @Column({ type: 'integer', default: 0 })
  commentCount: number;

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

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true, type: 'numeric' })
  @Field(() => Float, {
    description:
      'The number of currency-units the proposal is requesting (for infinite rounds)',
  })
  reqAmount: number;

  // @Deprecated. Previously used to distinguish whether it was an infinite auction, the infinite auction has now been removed, so this value would always be "auction".
  @Column({ default: 'auction' as ProposalParent })
  @Field(() => String)
  parentType: ProposalParent;

  @ApiProperty({ type: () => Auction })
  @ManyToOne(() => Auction, (auction) => auction.proposals, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => Auction)
  auction: Auction;

  @ApiProperty({
    description:
      'Indicates whether the user is allowed to vote. If true, the user can vote; if false, voting is not allowed.',
    type: Boolean,
  })
  canVote: boolean;
  @ApiProperty({
    description:
      'Displays the reason why the user is not allowed to vote when canVote is false. This property will be a string describing the reason, such as "You have already voted." or "Voting has been closed." If canVote is true, this property can be set to null or an empty string.',
    type: String,
    nullable: true,
  })
  disallowedVoteReason: string | null;
  @ApiProperty({
    description:
      'Indicates how the frontend should react based on this code.',
    type: Object,
  })
  voteState: any;

  toJSON() {
    if (this.votes && this.votes.length > 0) {
      this.votes = convertVoteListToDelegateVoteList(this.votes);
    }

    const thisPlain = instanceToPlain(this);
    return { ...thisPlain };
  }
}
