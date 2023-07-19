import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionsModule } from 'src/auction/auctions.module';
import { CommentsModule } from 'src/comment/comments.module';
import { DelegationModule } from 'src/delegation/delegation.module';
import { ApplicationModule } from 'src/delegation-application/application.module';
import { DelegateModule } from 'src/delegate/delegate.module';
import { CommunitiesModule } from 'src/community/community.module';
import { AdminModule } from 'src/admin/admin.module';

import configuration from 'src/config/configuration';
import { ProposalsModule } from 'src/proposal/proposals.module';
import { TasksModule } from 'src/task/tasks.module';
import { VotesModule } from 'src/vote/votes.module';
import config from '../../ormconfig';

/**
 * Import and provide base typeorm (mysql) related classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    VotesModule,
    AuctionsModule,
    ProposalsModule,
    CommunitiesModule,
    TasksModule,
    DelegationModule,
    ApplicationModule,
    DelegateModule,
    CommentsModule,
    AdminModule,
    TypeOrmModule.forRoot(config),
  ],
})
export class PostgresDatabaseProviderModule {}
