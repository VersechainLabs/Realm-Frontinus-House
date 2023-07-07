import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { InfiniteAuctionService } from 'src/infinite-auction/infinite-auction.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Delegate } from './delegate.entity';
import { Auction } from 'src/auction/auction.entity';
// import { AuctionsResolver } from './auction.resolver';
import { DelegatesController } from './delegates.controller';
import { DelegatesService } from './delegates.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delegate, Proposal, Community, InfiniteAuction, Auction]),
  ],
  controllers: [DelegatesController],
  providers: [
    DelegatesService,
    ProposalsService,
    // DelegatesResolver,
    CommunitiesService,
    InfiniteAuctionService,
  ],
  exports: [TypeOrmModule],
})
export class DelegatesModule {}
