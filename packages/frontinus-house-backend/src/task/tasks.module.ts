import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionsService } from '../auction/auctions.service';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { VotesService } from '../vote/votes.service';
import { Vote } from '../vote/vote.entity';
import { Community } from '../community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { DelegateService } from '../delegate/delegate.service';
import { Delegate } from '../delegate/delegate.entity';
import { DelegationService } from '../delegation/delegation.service';
import { Delegation } from '../delegation/delegation.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Proposal,
      Vote,
      Auction,
      Community,
      Snapshot,
      Delegate,
      Delegation,
    ]),
  ],
  providers: [
    ProposalsService,
    VotesService,
    AuctionsService,
    BlockchainService,
    DelegateService,
    DelegationService,
  ],
})
export class TasksModule {}
