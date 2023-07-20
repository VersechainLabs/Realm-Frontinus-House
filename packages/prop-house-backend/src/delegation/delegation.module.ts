import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Delegation } from './delegation.entity';
import { Auction } from 'src/auction/auction.entity';
// import { AuctionsResolver } from './auction.resolver';
import { DelegationController } from './delegation.controller';
import { DelegationService } from './delegation.service';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/admin/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delegation, Proposal, Community, Auction, Admin]),
  ],
  controllers: [DelegationController],
  providers: [
    DelegationService,
    ProposalsService,
    AdminService,
    CommunitiesService,
  ],
  exports: [TypeOrmModule],
})
export class DelegationModule {}
