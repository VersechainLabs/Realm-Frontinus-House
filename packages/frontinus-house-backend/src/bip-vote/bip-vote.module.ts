import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionsService } from '../auction/auctions.service';
import { BipVote } from './bip-vote.entity';
import { BipVoteController } from './bip-vote.controller';
import { BipVoteService } from './bip-vote.service';
import { Community } from '../community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { Delegation } from '../delegation/delegation.entity';
import { Delegate } from '../delegate/delegate.entity';
import { DelegateService } from '../delegate/delegate.service';
import { DelegationService } from '../delegation/delegation.service';
import { VotesService } from '../vote/votes.service';
import { BipRoundService } from 'src/bip-round/bip-round.service';
import { BipOptionService } from 'src/bip-option/bip-option.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BipVote,
      Auction,
      Community,
      Snapshot,
      Delegate,
      Delegation,
    ]),
  ],
  controllers: [BipVoteController],
  providers: [
    BipVoteService,
    BipRoundService,
    BipOptionService,
    BlockchainService,
  ],
  exports: [TypeOrmModule],
})
export class BipVoteModule {}
