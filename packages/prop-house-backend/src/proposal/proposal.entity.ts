import { Field, ObjectType } from '@nestjs/graphql';
import { Auction } from 'src/auction/auction.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseProposal } from './base-proposal.entity';
import { instanceToPlain } from 'class-transformer';
import { convertVoteListToDelegateVoteList } from '../vote/vote.entity';

@Entity('proposal')
@ObjectType()
export class Proposal extends BaseProposal {
  @ManyToOne(() => Auction, (auction) => auction.proposals)
  @JoinColumn()
  @Field(() => Auction)
  auction: Auction;

  parentType: 'auction';

  toJSON() {
    if (this.votes && this.votes.length > 0) {
      this.votes = convertVoteListToDelegateVoteList(this.votes);
    }

    const superPlain = super.toJSON();
    const thisPlain = instanceToPlain(this);
    return { ...superPlain, ...thisPlain };
  }
}
