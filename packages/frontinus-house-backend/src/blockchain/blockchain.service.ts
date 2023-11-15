import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import config from '../config/configuration';
import { getCurrentBlockNum } from 'frontinus-house-communities/dist/actions/getBlockNum';
import { getVotingPower } from 'frontinus-house-communities';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { findByState } from '../delegation/delegation.service';
import { DelegationState } from '../delegation/delegation.types';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm';
import { Delegate } from '../delegate/delegate.entity';
import { createPublicClient, http, PublicClient } from 'viem';
import { mainnet } from 'viem/chains';
import { Delegation } from '../delegation/delegation.entity';

@Injectable()
export class BlockchainService {
  private readonly provider: PublicClient;

  constructor(
    @InjectRepository(Snapshot)
    private snapshotRepository: Repository<Snapshot>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.provider = createPublicClient({
      chain: mainnet,
      transport: http(config().Web3RpcUrl),
    });
  }

  async getCurrentBlockNum(): Promise<number> {
    return getCurrentBlockNum(this.provider);
  }

  async getVotingPowerWithSnapshot(
    userAddress: string,
    communityAddress: string,
    blockTag?: number,
  ): Promise<number> {
    try {
      if (!userAddress || userAddress.length === 0) {
        return 0;
      }
      if (!blockTag) {
        blockTag = 0;
      }
      const cacheKey = `${userAddress}-${communityAddress}`.toLowerCase();
      if (blockTag > 0) {
        // First, search DB for snapshot:
        const existSnapshot = await this.snapshotRepository.findOne({
          where: { communityAddress, address: userAddress, blockNum: blockTag },
        });
        if (existSnapshot) {
          return existSnapshot.votingPower;
        }
      } else {
        const value = await this.cacheManager.get<number>(cacheKey);
        if (value) {
          return value;
        }
      }

      // Second, snapshot not found, search on chain:
      const votingPowerOnChain = await getVotingPower(
        userAddress,
        communityAddress,
        this.provider,
        blockTag,
      );

      if (blockTag > 0) {
        // Then, save the on-chain voting power to DB.snapshot:
        const newSnapshot = new Snapshot();
        newSnapshot.communityAddress = communityAddress;
        newSnapshot.blockNum = blockTag;
        newSnapshot.address = userAddress;
        newSnapshot.votingPower = votingPowerOnChain;
        // noinspection ES6MissingAwait . just a cache
        this.snapshotRepository.save(newSnapshot);
        return newSnapshot.votingPower;
      } else {
        await this.cacheManager.set(cacheKey, votingPowerOnChain);
        return votingPowerOnChain;
      }
    } catch (e) {
      console.error(
        `BlockchainService Exception: ${userAddress} @ ${blockTag}\n${e}`,
      );
      return 0;
    }
  }

  async getVotingPowerOnChain(
    userAddress: string,
    communityAddress: string,
    blockTag: number,
  ): Promise<number> {
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
  async cacheAll(
    delegateRepository: Repository<Delegate>,
    delegationRepository: Repository<Delegation>,
    communityAddress: string,
    blockNum: number,
  ) {
    const activeDelegations = await findByState(
      delegationRepository,
      DelegationState.ACTIVE,
    );

    let allDelegates = [];

    for (const delegation of activeDelegations) {
      const delegates = await delegateRepository.find({
        where: { delegationId: delegation.id },
      });
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
