import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionsService } from '../auction/auctions.service';
import { Vote } from '../vote/vote.entity';
import { BipOption } from './bip-option.entity';
import { BipOptionController } from './bip-option.controller';
import { BipOptionService } from './bip-option.service';
import { Community } from '../community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { Delegation } from '../delegation/delegation.entity';
import { Delegate } from '../delegate/delegate.entity';
import { DelegateService } from '../delegate/delegate.service';
import { DelegationService } from '../delegation/delegation.service';
import { VotesService } from '../vote/votes.service';
import { BipRoundService } from 'src/bip-round/bip-round.service';
import { BipVoteService } from 'src/bip-vote/bip-vote.service';
import { BipRound } from 'src/bip-round/bip-round.entity';
import { BipVote } from 'src/bip-vote/bip-vote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BipRound,
      BipOption,
      BipVote,
      Community,
      Snapshot,
      Delegate,
      Delegation,
    ]),
  ],
  controllers: [BipOptionController],
  providers: [
    BipRoundService,
    BipOptionService,
    BipVoteService,
    BlockchainService,
  ],
  exports: [TypeOrmModule],
})
export class BipOptionModule {}
