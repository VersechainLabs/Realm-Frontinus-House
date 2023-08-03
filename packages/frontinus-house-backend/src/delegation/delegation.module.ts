import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delegation } from './delegation.entity';
import { DelegationController } from './delegation.controller';
import { DelegationService } from './delegation.service';
import { AdminService } from '../admin/admin.service';
import { Admin } from '../admin/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Delegation, Admin])],
  controllers: [DelegationController],
  providers: [DelegationService, AdminService],
  exports: [TypeOrmModule],
})
export class DelegationModule {}
