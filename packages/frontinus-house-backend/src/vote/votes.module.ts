import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionsService } from '../auction/auctions.service';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { Vote } from './vote.entity';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { Community } from '../community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { Delegate } from '../delegate/delegate.entity';
import { Delegation } from '../delegation/delegation.entity';

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
  ],
  controllers: [VotesController],
  providers: [
    VotesService,
    AuctionsService,
    ProposalsService,
    BlockchainService,
  ],
  exports: [TypeOrmModule],
})
export class VotesModule {}
