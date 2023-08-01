import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import config from '../config/configuration';
import { JsonRpcProvider } from '@ethersproject/providers';
import { getCurrentBlockNum } from 'frontinus-house-communities/dist/actions/getBlockNum';
import { getVotingPower } from 'frontinus-house-communities';
import { Snapshot } from 'src/voting-power-snapshot/snapshot.entity';
import { DelegateService } from 'src/delegate/delegate.service';
import { DelegationService } from 'src/delegation/delegation.service';
import { DelegationState } from 'src/delegation/delegation.types';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm';

@Injectable()
export class BlockchainService {
  private readonly provider: JsonRpcProvider;

  constructor(
    private readonly delegateService: DelegateService,
    private readonly delegationService: DelegationService,

    @InjectRepository(Snapshot)
    private snapshotRepository: Repository<Snapshot>,
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(config().Web3RpcUrl);
  }

  async getCurrentBlockNum(): Promise<number> {
    await this.provider.ready;
    return getCurrentBlockNum(this.provider);
  }

  async getVotingPowerWithSnapshot(
    userAddress: string,
    communityAddress: string,
    blockTag: number,
  ): Promise<number> {
    // First, search DB for snapshot:
    const existSnapshot = await this.snapshotRepository.findOne({
      where: { communityAddress, address: userAddress, blockNum: blockTag },
    });
    if (existSnapshot) {
      return existSnapshot.votingPower;
    }

    // Second, snapshot not found, search on chain:
    await this.provider.ready;
    const votingPowerOnChain = await getVotingPower(
      userAddress,
      communityAddress,
      this.provider,
      blockTag,
    );

    // Then, save the on-chain voting power to DB.snapshot:
    const newSnapshot = new Snapshot();
    newSnapshot.communityAddress = communityAddress;
    newSnapshot.blockNum = blockTag;
    newSnapshot.address = userAddress;
    newSnapshot.votingPower = votingPowerOnChain;
    // noinspection ES6MissingAwait . just a cache
    this.snapshotRepository.save(newSnapshot);

    return newSnapshot.votingPower;
  }

  async getVotingPowerOnChain(
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

  // Old:
  // async getVotingPower(
  //   userAddress: string,
  //   communityAddress: string,
  //   blockTag: number,
  // ): Promise<number> {
  //   await this.provider.ready;
  //   return getVotingPower(
  //     userAddress,
  //     communityAddress,
  //     this.provider,
  //     blockTag,
  //   );
  // }

  // The addresses used here are probably from an address table, which is used to list all possible
  // users that may appear in the system.
  async cacheAll(communityAddress: string, blockNum: number) {
    const activeDelegations = await this.delegationService.findByState(
      DelegationState.ACTIVE,
    );

    let allDelegates = [];

    for (const delegation of activeDelegations) {
      const delegates = await this.delegateService.findByDelegationId(
        delegation.id,
      );
      allDelegates = allDelegates.concat(delegates);
    }

    // console.log("allDelegates:", allDelegates);

    const allAddress = [];

    // Cache both "from" & "to" address, b/c also need to count in "toAddress"'s voting power:
    for (const delegate of allDelegates) {
      if (!allAddress.includes(delegate.toAddress)) {
        allAddress.push(delegate.toAddress);
      }
      if (!allAddress.includes(delegate.fromAddress)) {
        allAddress.push(delegate.fromAddress);
      }
    }

    const snapshotList = [];
    for (const address of allAddress) {
      try {
        const votingPower = await this.getVotingPowerOnChain(
          address,
          communityAddress,
          blockNum,
        );

        const snapshot = new Snapshot();
        snapshot.communityAddress = communityAddress;
        snapshot.blockNum = blockNum;
        snapshot.address = address;
        snapshot.votingPower = votingPower;
        snapshotList.push(snapshot);
      } catch (error) {
        console.log('[getVotingPower error]', address, error.message);
      }
    }
    await this.snapshotRepository.save(snapshotList);

    return 'all done';
  }
}
