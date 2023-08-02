import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { VotesService } from 'src/vote/votes.service';
import { Vote } from 'src/vote/vote.entity';
import { Community } from 'src/community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from 'src/voting-power-snapshot/snapshot.entity';
import { DelegateService } from 'src/delegate/delegate.service';
import { Delegate } from 'src/delegate/delegate.entity';
import { DelegationService } from 'src/delegation/delegation.service';
import { Delegation } from 'src/delegation/delegation.entity';

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
