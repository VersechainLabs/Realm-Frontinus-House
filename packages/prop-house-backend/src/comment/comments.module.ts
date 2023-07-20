import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
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
    TypeOrmModule.forFeature([Comment, Delegation, Proposal, Community, Auction]),
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    ProposalsService,
    CommunitiesService,
  ],
  exports: [TypeOrmModule],
})
export class CommentsModule {}
