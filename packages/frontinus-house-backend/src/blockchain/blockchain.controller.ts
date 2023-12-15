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
  async test(@Query('address') userAddress: string ) {

    console.log('enter test');

    const commmunityAddress = process.env.COMMUNITY_ADDRESS;
    const blockHeight = await this.getBlocknumber();

    const vp = await this.blockchainService.getVotingPowerOnChain(
      userAddress,
      commmunityAddress,
      blockHeight,
    );

    return {
      'blockHeight': blockHeight,
      'address': userAddress,
      'weight': vp,
    };
  }
}
