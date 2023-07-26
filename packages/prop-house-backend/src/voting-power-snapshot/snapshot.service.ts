import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import config from '../config/configuration';
import { JsonRpcProvider } from '@ethersproject/providers';
import { getCurrentBlockNum } from 'prop-house-communities/dist/actions/getBlockNum';
import { getVotingPower } from 'prop-house-communities';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { DelegateService } from 'src/delegate/delegate.service';
import { DelegationService } from 'src/delegation/delegation.service';
import { DelegationState } from 'src/delegation/delegation.types';
import { Snapshot } from './snapshot.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SnapshotService {

  constructor(
    @InjectRepository(Snapshot) private snapshotRepository: Repository<Snapshot>,
    // private readonly blockchainService: BlockchainService,
    private readonly delegateService: DelegateService,
    private readonly delegationService: DelegationService,
    ) {}

  findBy(
    blockNum: number,
    address: string,
  ): Promise<Snapshot> {
    return this.snapshotRepository.findOne({
      where: { address, blockNum },
    });
  }

  // async cacheAll(blockNum: number) {
  //   const activeDelegations = await this.delegationService.findByState(DelegationState.ACTIVE)

  //   let allDelegates = [];

  //   for (const delegation of activeDelegations) {
  //     const delegates = await this.delegateService.findByDelegationId(delegation.id);
  //     allDelegates = allDelegates.concat(delegates);
  //   }

  //   // console.log("allDelegates:", allDelegates);

  //   let allAddress = [];

  //   // Cache both "from" & "to" address, b/c also need to count in "toAddress"'s voting power:
  //   for (const delegate of allDelegates) {
  //     if (!allAddress.includes(delegate.toAddress)) {
  //       allAddress.push(delegate.toAddress);
  //     }
  //     if (!allAddress.includes(delegate.fromAddress)) {
  //       allAddress.push(delegate.fromAddress);
  //     }
  //   }

  //   // console.log("allAddress:", allAddress);

  //   for (const address of allAddress) {
  //     try {
  //       // const votingPower = await this.blockchainService.getVotingPower("0xcdFe3d7eBFA793675426F150E928CD395469cA53", process.env.COMMUNITY_ADDRESS, 17665090);
  //       const votingPower = await this.blockchainService.getVotingPowerOnChain(address, blockNum);

  //       console.log("[getVotingPower success]", address, votingPower);
        
  //       const snapshot = new Snapshot();
  //       snapshot.blockNum = blockNum;
  //       snapshot.address = address;
  //       snapshot.votingPower = votingPower;

  //       const newRecord = await this.snapshotRepository.save(snapshot);
  //     } catch (error) {
  //       console.log("[getVotingPower error]", address, error.message);
  //     }
  //   }

  //   return "all done";
  // }

  async store(value: Snapshot): Promise<Snapshot> {
    return await this.snapshotRepository.save(value, { reload: true });
  }

}
