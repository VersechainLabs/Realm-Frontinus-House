import { Strategy } from '../types/Strategy';
import BigNumber from 'bignumber.js';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import ContractCallABI from '../abi/ContractCallABI.json';
import { parseBlockTag } from '../utils/parseBlockTag';
import { PublicClient } from 'viem';

export enum StrategyType {
  Erc721,
  ContractCall,
}

export type SnapshotStrategy = {
  address: string,
  strategyType: StrategyType,
  multiplier: number,
}

export const snapshotMultiple = (strategies: SnapshotStrategy[]): Strategy => {
  return async (userAddress: string, _communityAddress: string, blockTag: number, provider: PublicClient) => {
    const balances = await Promise.all(
      strategies.map(async strategy => {
        let power;
        switch (strategy.strategyType) {
          case StrategyType.Erc721:
            power = await getErc721Balance(userAddress, strategy.address, blockTag, provider);
            break;
          case StrategyType.ContractCall:
            power = await getContractCallBalance(userAddress, strategy.address, blockTag, provider);
            break;
        }

        return power.times(strategy.multiplier);
      }),
    );

    return balances.reduce((prev, current) => prev.plus(current)).toNumber();
  };
};

const getErc721Balance = async (userAddress: string, strategyAddress: string, blockTag: number, provider: PublicClient): Promise<BigNumber> => {
  const blockNumber = parseBlockTag(blockTag);
  try {
    let config = {
      address: strategyAddress as `0x{string}`,
      abi: BalanceOfABI,
      functionName: 'balanceOf',
      args: [userAddress],
      blockNumber: (blockNumber && blockNumber > 0) ? BigInt(blockNumber) : undefined,
    };
    const data = await provider.readContract(config);
    return new BigNumber(data as number);
  } catch (e) {
    console.warn(`[getErc721Balance] Error fetching vp for: ${userAddress} @ ${blockTag} with err:\n${e}`);
    throw Error(`Error fetching name for contract ${strategyAddress}`);
  }
};

const getContractCallBalance = async (userAddress: string, strategyAddress: string, blockTag: number, provider: PublicClient): Promise<BigNumber> => {
  const blockNumber = parseBlockTag(blockTag);
  try {
    let config = {
      address: strategyAddress as `0x{string}`,
      abi: ContractCallABI,
      functionName: 'getNumberRealms',
      args: [userAddress],
      blockNumber: (blockNumber && blockNumber > 0) ? BigInt(blockNumber) : undefined,
    };
    const data = await provider.readContract(config);
    return new BigNumber(data as number);
  } catch (e) {
    console.warn(`[getContractCallBalance] Error fetching vp for: ${userAddress} @ ${blockTag} with err:\n${e}`);
    throw Error(`Error fetching name for contract ${strategyAddress}`);
  }
};

