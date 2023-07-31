import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Delegate } from './delegate.entity';
import { Delegation } from 'src/delegation/delegation.entity';
import { DelegationService } from 'src/delegation/delegation.service';
import { Auction } from 'src/auction/auction.entity';
// import { AuctionsResolver } from './auction.resolver';
import { DelegateController } from './delegate.controller';
import { DelegateService } from './delegate.service';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/admin/admin.entity';
import { Application } from 'src/delegation-application/application.entity';
import { ApplicationService } from 'src/delegation-application/application.service';
import { SnapshotService } from 'src/voting-power-snapshot/snapshot.service';
import { Snapshot } from 'src/voting-power-snapshot/snapshot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Delegate,
      Delegation,
      Proposal,
      Community,
      Auction,
      Admin,
      Application,
      Snapshot,
    ]),
  ],
  controllers: [DelegateController],
  providers: [
    DelegateService,
    DelegationService,
    ProposalsService,
    AdminService,
    CommunitiesService,
    ApplicationService,
    SnapshotService,
  ],
  exports: [TypeOrmModule],
})
export class DelegateModule {}
