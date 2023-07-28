import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Proposal } from 'src/proposal/proposal.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Delegate } from '../delegate/delegate.entity';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { Address } from '../types/address';
import { IsEthereumAddress } from 'class-validator';

@Entity()
@ObjectType()
export class Vote {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ default: 1 })
  @Field(() => Int)
  direction: number;

  @ApiProperty({ description: 'The signer address' })
  @Column()
  @IsEthereumAddress()
  @Field(() => String)
  address: Address;

  @ApiProperty({ type: () => Proposal })
  @ManyToOne(() => Proposal, (proposal) => proposal.votes)
  @JoinColumn()
  proposal: Proposal;

  @ApiProperty()
  @Column()
  @Field(() => Int)
  proposalId: number;

  @ApiProperty()
  @Column()
  @Field(() => Int)
  auctionId: number;

  @ApiProperty({
    description:
      'The weight cast by the user is calculated according to the delegate relationship',
  })
  @Column({ default: 0 })
  @Field(() => Int)
  weight: number;

  @ApiProperty({
    description:
      'The user actually owns the weight, ignoring the delegate relationship.',
  })
  @Column({ default: 0 })
  @Field(() => Int)
  actualWeight: number;

  @ApiProperty()
  @Column({ default: null })
  @Field(() => Int)
  blockHeight: number;

  @ApiProperty({
    description:
      'If this vote is cast due to a delegate relationship, then the delegate relationship will be recorded in this value.',
  })
  @Column({ default: null })
  @Field(() => Int)
  delegateId?: number;

  @ApiProperty()
  @Column({ default: null })
  @Field(() => String)
  delegateAddress?: string;

  @ApiProperty()
  @ManyToOne(() => Delegate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'delegateId' })
  delegate: Delegate | null;

  @ApiProperty({
    description:
      'If the current voter receives a delegate from others, it will be placed in this list (including the current voter themselves).',
  })
  delegateList: Vote[];

  // @ApiProperty()
  @Column()
  @Field(() => Date)
  createdDate?: Date;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  constructor(opts?: Partial<Vote>) {
    if (opts) {
      this.direction = opts.direction;
      this.proposal = opts.proposal;
      this.proposalId = opts.proposalId;
      this.auctionId = opts.auctionId;
      this.weight = opts.weight;
      this.actualWeight = opts.actualWeight;
      this.blockHeight = opts.blockHeight;
      this.delegateId = opts.delegateId;
      this.delegateAddress = opts.delegateAddress;
    }
  }
}

export function convertVoteListToDelegateVoteList(voteList: Vote[]) {
  const _map = {};
  voteList.forEach((v) => {
    _map[v.address] = v;
    v.delegateList = [];
  });

  const result = [];
  voteList.forEach((v) => {
    if (v.delegateAddress) {
      if (_map[v.delegateAddress].delegateList) {
        _map[v.delegateAddress].delegateList.push(v);
      } else {
        _map[v.delegateAddress].delegateList = [v];
      }
    } else {
      result.push(v);
    }
  });

  result.forEach((v) => {
    if (v.delegateList && v.delegateList.length > 0) {
      const selfVote = {
        ...v,
      } as Vote;
      selfVote.delegateList = [];
      v.delegateList.unshift(selfVote);
    }
  });

  return result;
}
