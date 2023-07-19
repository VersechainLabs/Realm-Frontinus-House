import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { InfiniteAuctionService } from 'src/infinite-auction/infinite-auction.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Comment } from './comment.entity';
import { Auction } from 'src/auction/auction.entity';
import { Delegation } from 'src/delegation/delegation.entity';
// import { AuctionsResolver } from './auction.resolver';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Delegation, Proposal, Community, InfiniteAuction, Auction]),
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    ProposalsService,
    CommunitiesService,
    InfiniteAuctionService,
  ],
  exports: [TypeOrmModule],
})
export class CommentsModule {}
