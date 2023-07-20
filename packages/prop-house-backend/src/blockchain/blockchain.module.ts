import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [BlockchainService],
})
export class BlockchainModule {}
