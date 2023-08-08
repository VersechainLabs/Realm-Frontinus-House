import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from '../community/community.entity';
import { CommunitiesService } from '../community/community.service';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { Comment } from './comment.entity';
import { Auction } from '../auction/auction.entity';
import { Delegation } from '../delegation/delegation.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { ApplicationService } from '../delegation-application/application.service';
import { Application } from '../delegation-application/application.entity';
import { Delegate } from '../delegate/delegate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Comment,
      Delegation,
      Proposal,
      Community,
      Auction,
      Application,
      Delegate,
    ]),
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    ProposalsService,
    CommunitiesService,
    ApplicationService,
  ],
  exports: [TypeOrmModule],
})
export class CommentsModule {}
