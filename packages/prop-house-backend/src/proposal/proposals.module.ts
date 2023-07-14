import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { InfiniteAuctionModule } from 'src/infinite-auction/infinite-auction.module';
import { InfiniteAuctionService } from 'src/infinite-auction/infinite-auction.service';
import { Vote } from 'src/vote/vote.entity';
import { InfiniteAuctionProposalsResolver } from './infauction-proposal.resolver';
import { Proposal } from './proposal.entity';
import { ProposalsResolver } from './proposal.resolver';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';
import { Community } from 'src/community/community.entity';
import { Admin } from 'src/admin/admin.entity';
import { AdminService } from 'src/admin/admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal, Vote, Auction, InfiniteAuction, Community, Admin]),
  ],
  controllers: [ProposalsController],
  providers: [
    ProposalsService,
    AuctionsService,
    InfiniteAuctionService,
    AdminService,
    ProposalsResolver,
    InfiniteAuctionProposalsResolver,
  ],
  exports: [TypeOrmModule],
})
export class ProposalsModule {}
