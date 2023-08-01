import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Vote } from 'src/vote/vote.entity';
import { VotesController } from 'src/vote/votes.controller';
import { VotesService } from 'src/vote/votes.service';
import { Community } from 'src/community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { SnapshotService } from 'src/voting-power-snapshot/snapshot.service';
import { Snapshot } from 'src/voting-power-snapshot/snapshot.entity';
import { DelegateService } from 'src/delegate/delegate.service';
import { Delegate } from 'src/delegate/delegate.entity';
import { DelegationService } from 'src/delegation/delegation.service';
import { Delegation } from 'src/delegation/delegation.entity';
import { CommunitiesService } from 'src/community/community.service';
import { BlockchainController } from './blockchain.controller';
import { BullModule } from '@nestjs/bull';
import { AudioProcessor } from './blockchain.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vote,
      Proposal,
      Auction,
      Community,
      Snapshot,
      Delegate,
      Delegation,
    ]),
    BullModule.registerQueue({
      name: 'audio',
    }),
  ],
  controllers: [BlockchainController],
  providers: [
    VotesService,
    AuctionsService,
    ProposalsService,
    CommunitiesService,
    BlockchainService,
    SnapshotService,
    DelegateService,
    DelegationService,
    AudioProcessor
  ],
  exports: [TypeOrmModule],
})
export class BlockchainModule {}
