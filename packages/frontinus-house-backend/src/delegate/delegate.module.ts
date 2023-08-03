import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delegate } from './delegate.entity';
import { Delegation } from '../delegation/delegation.entity';
import { DelegateController } from './delegate.controller';
import { DelegateService } from './delegate.service';
import { Application } from '../delegation-application/application.entity';
import { ApplicationService } from '../delegation-application/application.service';

@Module({
  imports: [TypeOrmModule.forFeature([Delegate, Delegation, Application])],
  controllers: [DelegateController],
  providers: [DelegateService, ApplicationService],
  exports: [TypeOrmModule],
})
export class DelegateModule {}
