import { Strategy } from '../types/Strategy';
import { Provider } from '@ethersproject/providers';
import BigNumber from 'bignumber.js';
import { Contract } from 'ethers';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import ContractCallABI from '../abi/ContractCallABI.json';
import { parseBlockTag } from '../utils/parseBlockTag';

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
  return async (userAddress: string, _communityAddress: string, blockTag: number, provider: Provider) => {

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

const getErc721Balance = async (userAddress: string, strategyAddress: string, blockTag: number, provider: Provider): Promise<BigNumber> => {
  const contract = new Contract(strategyAddress, BalanceOfABI, provider);
  const balance = await contract.balanceOf(userAddress, { blockTag: parseBlockTag(blockTag) });
  return new BigNumber(balance.toString());
};

const getContractCallBalance = async (userAddress: string, strategyAddress: string, blockTag: number, provider: Provider): Promise<BigNumber> => {
  const contract = new Contract(strategyAddress, ContractCallABI, provider);
  const balance = await contract.getNumberRealms(userAddress, { blockTag: parseBlockTag(blockTag) });
  return new BigNumber(balance.toString());
};

