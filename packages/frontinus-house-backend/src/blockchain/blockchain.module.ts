import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { AudioProcessor } from './blockchain.processor';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.registerQueue({
      name: 'audio',
    }),
  ],
  providers: [BlockchainService, AudioProcessor],
})
export class BlockchainModule {}
