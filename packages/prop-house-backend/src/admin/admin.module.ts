import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { InfiniteAuctionService } from 'src/infinite-auction/infinite-auction.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Admin } from './admin.entity';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { Delegate } from 'src/delegate/delegate.entity';
import { AdminService } from './admin.service';
import { AdminsController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin,Proposal,InfiniteAuction,Auction,Community]),
  ],
  controllers: [AdminsController],
  providers: [
    AdminService,
    AuctionsService,
    // // DelegatesService,
    ProposalsService,
    // // DelegatesResolver,
    CommunitiesService,
    InfiniteAuctionService,
  ],
  exports: [TypeOrmModule],
})
export class AdminModule {}
