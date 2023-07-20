import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import config from '../config/configuration';
import { JsonRpcProvider } from '@ethersproject/providers';
import { getCurrentBlockNum } from 'prop-house-communities/dist/actions/getBlockNum';
import { getVotingPower } from 'prop-house-communities';

@Injectable()
export class BlockchainService {
  private readonly provider: JsonRpcProvider;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config().Web3RpcUrl);
  }

  async getCurrentBlockNum(): Promise<number> {
    await this.provider.ready;
    return getCurrentBlockNum(this.provider);
  }

  async getVotingPower(
    userAddress: string,
    communityAddress: string,
    blockTag: number,
  ): Promise<number> {
    await this.provider.ready;
    return getVotingPower(
      userAddress,
      communityAddress,
      this.provider,
      blockTag,
    );
  }
}
