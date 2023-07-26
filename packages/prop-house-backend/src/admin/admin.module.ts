import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Admin } from './admin.entity';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { AdminService } from './admin.service';
import { AdminsController } from './admin.controller';
import { BlockchainService } from '../blockchain/blockchain.service';
import { SnapshotService } from 'src/voting-power-snapshot/snapshot.service';
import { Snapshot } from 'src/voting-power-snapshot/snapshot.entity';
import { DelegateService } from 'src/delegate/delegate.service';
import { Delegate } from 'src/delegate/delegate.entity';
import { DelegationService } from 'src/delegation/delegation.service';
import { Delegation } from 'src/delegation/delegation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Proposal, Auction, Community, Snapshot, Delegate, Delegation])],
  controllers: [AdminsController],
  providers: [
    AdminService,
    AuctionsService,
    ProposalsService,
    CommunitiesService,
    BlockchainService,
    SnapshotService,
    DelegateService,
    DelegationService, 
  ],
  exports: [TypeOrmModule],
})
export class AdminModule {}
