import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { SignedEntity } from 'src/entities/signed';
import { Vote } from 'src/vote/vote.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProposalParent } from './proposal.types';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

@ObjectType()
export abstract class BaseProposal extends SignedEntity {
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

  @ApiProperty({ type: () => Vote, isArray: true })
  @OneToMany(() => Vote, (vote) => vote.proposal)
  @JoinColumn()
  @Field(() => [Vote])
  votes: Vote[];

  @ApiProperty()
  @Column({ type: 'integer', default: 0 })
  @Field(() => Int)
  voteCount: number;

  @BeforeUpdate()
  updateVoteCount() {
    this.voteCount = this.votes.reduce((acc, vote) => {
      return Number(acc) + Number(vote.weight);
    }, 0);
  }

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
}
