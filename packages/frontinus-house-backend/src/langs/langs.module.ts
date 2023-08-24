import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Langs } from './langs.entity';
import { LangService } from './langs.service';
import { LangController } from './langs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Langs])],
  controllers: [LangController],
  providers: [LangService],
  exports: [TypeOrmModule],
})
export class LangModule {}
