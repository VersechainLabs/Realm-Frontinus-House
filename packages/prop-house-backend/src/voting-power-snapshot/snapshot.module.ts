import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Delegate } from 'src/delegate/delegate.entity';
import { Delegation } from 'src/delegation/delegation.entity';
import { DelegationService } from 'src/delegation/delegation.service';
import { Auction } from 'src/auction/auction.entity';
// import { AuctionsResolver } from './auction.resolver';
import { DelegateController } from 'src/delegate/delegate.controller';
import { DelegateService } from 'src/delegate/delegate.service';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/admin/admin.entity';
import { SnapshotController } from './snapshot.controller';
import { SnapshotService } from './snapshot.service';
import { Snapshot } from './snapshot.entity';
import { BlockchainService } from 'src/blockchain/blockchain.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Snapshot,
      Delegate,
      Delegation,
      Proposal,
      Community,
      Auction,
      Admin,
    ]),
  ],
  controllers: [SnapshotController],
  providers: [
    SnapshotService,
    DelegateService,
    DelegationService,
    ProposalsService,
    AdminService,
    CommunitiesService,
    BlockchainService,
  ],
  exports: [TypeOrmModule],
})
export class SnapshotModule {}
