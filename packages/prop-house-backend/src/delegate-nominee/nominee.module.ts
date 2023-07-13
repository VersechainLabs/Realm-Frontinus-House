import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { InfiniteAuctionService } from 'src/infinite-auction/infinite-auction.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Delegate } from 'src/delegate/delegate.entity';
import { DelegatesController } from 'src/delegate/delegates.controller';
import { DelegatesService } from 'src/delegate/delegates.service';
import { Nominee } from './nominee.entity';
import { NomineeController } from './nominee.controller';
import { NomineeService } from './nominee.service';
import { Auction } from 'src/auction/auction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delegate, Proposal, Community, InfiniteAuction, Nominee, Auction]),
  ],
  controllers: [NomineeController],
  providers: [
    DelegatesService,
    ProposalsService,
    InfiniteAuctionService,
    // DelegatesResolver,
    CommunitiesService,
    NomineeService,
  ],
  exports: [TypeOrmModule],
})
export class NomineeModule {}
