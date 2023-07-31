import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { Vote } from 'src/vote/vote.entity';
import { Proposal } from './proposal.entity';
import { ProposalsResolver } from './proposal.resolver';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';
import { Community } from 'src/community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from 'src/voting-power-snapshot/snapshot.entity';
import { Delegation } from 'src/delegation/delegation.entity';
import { Delegate } from 'src/delegate/delegate.entity';
import { SnapshotService } from 'src/voting-power-snapshot/snapshot.service';
import { DelegateService } from 'src/delegate/delegate.service';
import { DelegationService } from 'src/delegation/delegation.service';

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
    ProposalsResolver,
    BlockchainService,
    SnapshotService,
    DelegateService,
    DelegationService,
  ],
  exports: [TypeOrmModule],
})
export class ProposalsModule {}
