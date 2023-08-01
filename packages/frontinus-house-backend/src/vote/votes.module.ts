import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Vote } from './vote.entity';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { Community } from 'src/community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from 'src/voting-power-snapshot/snapshot.entity';
import { DelegateService } from 'src/delegate/delegate.service';
import { Delegate } from 'src/delegate/delegate.entity';
import { DelegationService } from 'src/delegation/delegation.service';
import { Delegation } from 'src/delegation/delegation.entity';
import { CommunitiesService } from 'src/community/community.service';

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
