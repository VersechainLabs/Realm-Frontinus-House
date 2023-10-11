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
    // userAddress = '0xD72bb0961368F1A5c566E0ac3AFCA62afFa20F14';

    const commmunityAddress = "0x7AFe30cB3E53dba6801aa0EA647A0EcEA7cBe18d";
    const blockHeight = await this.getBlocknumber();

    // return this.blockchainService.getCurrentBlockNum();
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
