import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { CommunitiesController } from './community.controller';
import { Community } from './community.entity';
import { CommunityResolver } from './community.resolver';
import { CommunitiesService } from './community.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { SnapshotService } from 'src/voting-power-snapshot/snapshot.service';
import { Snapshot } from 'src/voting-power-snapshot/snapshot.entity';
import { DelegateService } from 'src/delegate/delegate.service';
import { Delegate } from 'src/delegate/delegate.entity';
import { DelegationService } from 'src/delegation/delegation.service';
import { Delegation } from 'src/delegation/delegation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Community,
      Auction,
      Snapshot,
      Delegate,
      Delegation,
    ]),
  ],
  controllers: [CommunitiesController],
  providers: [
    CommunitiesService,
    AuctionsService,
    CommunityResolver,
    BlockchainService,
    SnapshotService,
    DelegateService,
    DelegationService,
  ],
  exports: [TypeOrmModule],
})
export class CommunitiesModule {}
