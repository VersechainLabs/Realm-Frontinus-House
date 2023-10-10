import { InjectQueue } from '@nestjs/bull';
import { Controller, Get, Post, Query } from '@nestjs/common';
import { Queue } from 'bull';
import { BlockchainService } from './blockchain.service';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('audio')
export class BlockchainController {
  constructor(
    @InjectQueue('bchain') private readonly audioQueue: Queue,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Post('transcode')
  async transcode() {
    await this.audioQueue.add('transcode', {
      file: 'blockchain.mp3',
    });
  }

  @Get('blocknumber')
  async getBlocknumber() {
    return await this.blockchainService.getCurrentBlockNum();
  }

  @Get('vp')
  async getVp(
    @Query('address') address: string,
    @Query('community') communityAddress: string,
    @Query('blocknum') blocknum: number,
    @Query('ignoreCache') ignoreCache: boolean,
  ) {
    if (ignoreCache) {
      console.log(`Get VP: ${communityAddress}, ${address}, ${blocknum}`);
      return await this.blockchainService.getVotingPowerOnChain(
        address,
        communityAddress,
        blocknum,
      );
    } else {
      return await this.blockchainService.getVotingPowerWithSnapshot(
        address,
        communityAddress,
        blocknum,
      );
    }
  }

  @Get('test')
  async test() {
    console.log('enter test');

    const commmunityAddress = "0x7AFe30cB3E53dba6801aa0EA647A0EcEA7cBe18d";

    // return this.blockchainService.getCurrentBlockNum();
    return this.blockchainService.getVotingPowerOnChain(
      '0x1a5E02A0a85118C3382fa3c161cb78110F97299a',
      commmunityAddress,
      17781403,
    );
  }
}
