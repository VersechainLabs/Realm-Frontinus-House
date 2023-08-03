import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delegation } from 'src/delegation/delegation.entity';
import { DelegationService } from 'src/delegation/delegation.service';
import { Application } from './application.entity';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { Delegate } from '../delegate/delegate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Delegation, Application, Delegate])],
  controllers: [ApplicationController],
  providers: [DelegationService, ApplicationService],
  exports: [TypeOrmModule],
})
export class ApplicationModule {}
