import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionsService } from '../auction/auctions.service';
import { CommunitiesController } from './community.controller';
import { Community } from './community.entity';
import { CommunityResolver } from './community.resolver';
import { CommunitiesService } from './community.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { DelegateService } from '../delegate/delegate.service';
import { Delegate } from '../delegate/delegate.entity';
import { DelegationService } from '../delegation/delegation.service';
import { Delegation } from '../delegation/delegation.entity';

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
    DelegateService,
    DelegationService,
  ],
  exports: [TypeOrmModule],
})
export class CommunitiesModule {}
