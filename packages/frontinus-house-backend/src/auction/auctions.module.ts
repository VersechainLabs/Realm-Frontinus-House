import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from '../community/community.entity';
import { CommunitiesService } from '../community/community.service';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { Auction } from './auction.entity';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { DelegateService } from '../delegate/delegate.service';
import { Delegate } from '../delegate/delegate.entity';
import { DelegationService } from '../delegation/delegation.service';
import { Delegation } from '../delegation/delegation.entity';
import { AdminService } from '../admin/admin.service';
import { Admin } from '../admin/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
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
    AdminService,
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
