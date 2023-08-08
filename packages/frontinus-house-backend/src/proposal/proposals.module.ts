import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionsService } from '../auction/auctions.service';
import { Vote } from '../vote/vote.entity';
import { Proposal } from './proposal.entity';
import { ProposalsResolver } from './proposal.resolver';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';
import { Community } from '../community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { Delegation } from '../delegation/delegation.entity';
import { Delegate } from '../delegate/delegate.entity';
import { DelegateService } from '../delegate/delegate.service';
import { DelegationService } from '../delegation/delegation.service';
import { VotesService } from '../vote/votes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Proposal,
      Vote,
      Auction,
      Community,
      Snapshot,
      Delegate,
      Delegation,
    ]),
  ],
  controllers: [ProposalsController],
  providers: [
    ProposalsService,
    AuctionsService,
    BlockchainService,
    DelegateService,
    DelegationService,
    VotesService,
  ],
  exports: [TypeOrmModule],
})
export class ProposalsModule {}
