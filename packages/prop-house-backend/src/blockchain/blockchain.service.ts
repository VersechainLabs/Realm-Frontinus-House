import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import config from '../config/configuration';
import { JsonRpcProvider } from '@ethersproject/providers';
import { getCurrentBlockNum } from 'prop-house-communities/dist/actions/getBlockNum';
import { getVotingPower } from 'prop-house-communities';
import { SnapshotService } from 'src/voting-power-snapshot/snapshot.service';
import { Snapshot } from 'src/voting-power-snapshot/snapshot.entity';
import { DelegateService } from 'src/delegate/delegate.service';
import { DelegationService } from 'src/delegation/delegation.service';
import { DelegationState } from 'src/delegation/delegation.types';

@Injectable()
export class BlockchainService {
  private readonly provider: JsonRpcProvider;

  constructor(
    private readonly snapshotService: SnapshotService,
    private readonly delegateService: DelegateService,
    private readonly delegationService: DelegationService,
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
    const existSnapshot = await this.snapshotService.findBy(
      blockTag,
      userAddress,
    );
    console.log('First - existSnapshot:', existSnapshot);

    if (existSnapshot) {
      return existSnapshot.votingPower;
    }

    // Second, snapshot not found, search on chain:
    await this.provider.ready;
    console.log(`community: ${communityAddress}`);
    const votingPowerOnChain = await getVotingPower(
      userAddress,
      communityAddress,
      this.provider,
      blockTag,
    );
    console.log('Second - votingPowerOnChain:', votingPowerOnChain);

    // Then, save the on-chain voting power to DB.snapshot:
    const newSnapshot = new Snapshot();
    newSnapshot.blockNum = blockTag;
    newSnapshot.address = userAddress;
    newSnapshot.votingPower = votingPowerOnChain;
    console.log('Then - store newSnapshot:', newSnapshot);
    this.snapshotService.store(newSnapshot);

    return newSnapshot.votingPower;
  }

  async getVotingPowerOnChain(
    userAddress: string,
    blockTag: number,
  ): Promise<number> {
    await this.provider.ready;
    return getVotingPower(
      userAddress,
      process.env.COMMUNITY_ADDRESS,
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

  async cacheAll(blockNum: number) {
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

    // console.log("allAddress:", allAddress);

    for (const address of allAddress) {
      try {
        // const votingPower = await this.blockchainService.getVotingPower("0xcdFe3d7eBFA793675426F150E928CD395469cA53", process.env.COMMUNITY_ADDRESS, 17665090);
        const votingPower = await this.getVotingPowerOnChain(address, blockNum);

        console.log('[getVotingPower success]', address, votingPower);

        const snapshot = new Snapshot();
        snapshot.blockNum = blockNum;
        snapshot.address = address;
        snapshot.votingPower = votingPower;

        const newRecord = await this.snapshotService.store(snapshot);
      } catch (error) {
        console.log('[getVotingPower error]', address, error.message);
      }
    }

    return 'all done';
  }
}
