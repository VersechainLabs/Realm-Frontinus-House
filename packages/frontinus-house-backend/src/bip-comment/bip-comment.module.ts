import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from '../community/community.entity';
import { CommunitiesService } from '../community/community.service';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { Auction } from '../auction/auction.entity';
import { Delegation } from '../delegation/delegation.entity';
import { ApplicationService } from '../delegation-application/application.service';
import { Application } from '../delegation-application/application.entity';
import { Delegate } from '../delegate/delegate.entity';
import { BipComment } from './bip-comment.entity';
import { BipCommentsController } from './bip-comment.controller';
import { BipOption } from 'src/bip-option/bip-option.entity';
import { BipRound } from 'src/bip-round/bip-round.entity';
import { BipCommentsService } from './bip-comment.service';
import { BipRoundService } from 'src/bip-round/bip-round.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { SnapshotModule } from 'src/voting-power-snapshot/snapshot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BipComment,
      BipOption,
      BipRound,
      Delegation,
      Delegate,
      Application,
    ]),
    SnapshotModule,
  ],
  controllers: [BipCommentsController],
  providers: [
    BipCommentsService,
    BipRoundService,
    BlockchainService,
    ApplicationService,
  ],
  exports: [TypeOrmModule],
})
export class BipCommentsModule {}
