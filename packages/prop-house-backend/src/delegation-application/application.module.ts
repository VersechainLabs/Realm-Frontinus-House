import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { InfiniteAuctionService } from 'src/infinite-auction/infinite-auction.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Delegation } from 'src/delegation/delegation.entity';
import { DelegationController } from 'src/delegation/delegation.controller';
import { DelegationService } from 'src/delegation/delegation.service';
import { Application } from './application.entity';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { Auction } from 'src/auction/auction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delegation, Proposal, Community, InfiniteAuction, Application, Auction]),
  ],
  controllers: [ApplicationController],
  providers: [
    DelegationService,
    ProposalsService,
    InfiniteAuctionService,
    CommunitiesService,
    ApplicationService,
  ],
  exports: [TypeOrmModule],
})
export class ApplicationModule {}
