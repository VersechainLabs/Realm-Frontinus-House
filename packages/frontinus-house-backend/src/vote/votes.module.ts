import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionsService } from '../auction/auctions.service';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { Vote } from './vote.entity';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { Community } from '../community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { DelegateService } from '../delegate/delegate.service';
import { Delegate } from '../delegate/delegate.entity';
import { DelegationService } from '../delegation/delegation.service';
import { Delegation } from '../delegation/delegation.entity';
import { CommunitiesService } from '../community/community.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vote,
      Proposal,
      Auction,
      Community,
      Snapshot,
      Delegate,
      Delegation,
    ]),
  ],
  controllers: [VotesController],
  providers: [
    VotesService,
    AuctionsService,
    ProposalsService,
    CommunitiesService,
    BlockchainService,
    DelegateService,
    DelegationService,
  ],
  exports: [TypeOrmModule],
})
export class VotesModule {}
