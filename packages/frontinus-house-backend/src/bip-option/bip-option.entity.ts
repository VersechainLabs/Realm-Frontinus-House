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
import { Float, Int } from '@nestjs/graphql/dist/scalars';
import { IsEthereumAddress } from 'class-validator';
import { VoteStatesClass } from '@nouns/frontinus-house-wrapper';
import { BipVote } from 'src/bip-vote/bip-vote.entity';
import { BipRound } from 'src/bip-round/bip-round.entity';

@Entity()
@ObjectType()
export class BipOption {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @ApiProperty({ description: 'The signer address' })
  @Column()
  @Field(() => String)
  address: Address;

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

  // @ApiProperty({ type: () => Auction })
  @ManyToOne(() => BipRound, (bipRound) => bipRound.bipOptions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => BipRound)
  bipRound: BipRound;

  @ApiProperty()
  @Column()
  bipRoundId: number;

  @ApiProperty()
  @Column({ nullable: true })
  @Field(() => String)
  previewImage: string;

  @ApiProperty({ type: () => BipVote, isArray: true })
  @OneToMany(() => BipVote, (bipVote) => bipVote.bipOption, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => [BipVote])
  bipVotes: BipVote[];

  @ApiProperty()
  @Column({ type: 'integer', default: 0 })
  @Field(() => Int)
  voteCount: number;


  @BeforeUpdate()
  updateVoteCount() {
    if (this.bipVotes) {
      this.voteCount = this.bipVotes.reduce((acc, vote) => {
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

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;


  // noinspection JSUnusedGlobalSymbols : use for exclude attrs
  toJSON() {
    // if (this.votes && this.votes.length > 0) {
    //   this.votes = convertVoteListToDelegateVoteList(this.votes);
    // }

    const thisPlain = instanceToPlain(this);
    return { ...thisPlain };
  }
}
