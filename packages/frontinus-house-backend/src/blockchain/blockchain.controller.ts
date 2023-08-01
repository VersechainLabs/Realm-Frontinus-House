import { InjectQueue } from '@nestjs/bull';
import { Controller, Get, Post } from '@nestjs/common';
import { Queue } from 'bull';
import { BlockchainService } from './blockchain.service';

@Controller('audio')
export class BlockchainController {
  constructor(@InjectQueue('audio') private readonly audioQueue: Queue,
    private readonly blockchainService: BlockchainService,
    ) {}

  @Post('transcode')
  async transcode() {
    await this.audioQueue.add('transcode', {
      file: 'blockchain.mp3',
    });
  }

  @Get('test')
  async test() {
    console.log("enter test");
    // return this.blockchainService.getCurrentBlockNum();
    return this.blockchainService.getVotingPowerOnChain(
        "0x1a5E02A0a85118C3382fa3c161cb78110F97299a",
        process.env.COMMUNITY_ADDRESS,
        17781403
        );
  }  
}