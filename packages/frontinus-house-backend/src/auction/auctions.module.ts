import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Auction } from './auction.entity';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from 'src/voting-power-snapshot/snapshot.entity';
import { DelegateService } from 'src/delegate/delegate.service';
import { Delegate } from 'src/delegate/delegate.entity';
import { DelegationService } from 'src/delegation/delegation.service';
import { Delegation } from 'src/delegation/delegation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Auction,
      Proposal,
      Community,
      Snapshot,
      Delegate,
      Delegation,
    ]),
  ],
  controllers: [AuctionsController],
  providers: [
    AuctionsService,
    ProposalsService,
    CommunitiesService,
    BlockchainService,
    DelegateService,
    DelegationService,
  ],
  exports: [TypeOrmModule],
})
export class AuctionsModule {}
