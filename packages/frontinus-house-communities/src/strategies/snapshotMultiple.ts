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
  address: string;
  strategyType: StrategyType;
  multiplier: number;
};

export const snapshotMultiple = (strategies: SnapshotStrategy[]): Strategy => {
  return async (
    userAddress: string,
    _communityAddress: string,
    blockTag: number,
    provider: PublicClient,
  ) => {
    const balances = await Promise.all(
      strategies.map(async strategy => {
        let power;
        switch (strategy.strategyType) {
          case StrategyType.Erc721:
            power = await getErc721Balance(
              userAddress,
              strategy.address,
              blockTag,
              provider,
              0,
            );
            break;
          case StrategyType.ContractCall:
            power = await getContractCallBalance(
              userAddress,
              strategy.address,
              blockTag,
              provider,
              0,
            );
            break;
        }

        return power.times(strategy.multiplier);
      }),
    );

    return balances.reduce((prev, current) => prev.plus(current)).toNumber();
  };
};

const getErc721Balance = async (
  userAddress: string,
  strategyAddress: string,
  blockTag: number,
  provider: PublicClient,
  retryCount: number,
): Promise<BigNumber> => {
  const blockNumber = parseBlockTag(blockTag);
  try {
    let config = {
      address: strategyAddress as `0x{string}`,
      abi: BalanceOfABI,
      functionName: 'balanceOf',
      args: [userAddress],
      blockNumber: blockNumber && blockNumber > 0 ? BigInt(blockNumber) : undefined,
    };
    const data = await provider.readContract(config);
    return new BigNumber(data as number);
  } catch (e) {
    console.warn(
      `[getErc721Balance] Error fetching vp for: ${userAddress} @ ${blockTag} with err:\n${e}`,
    );

    if (retryCount < 3) {
      // There's some exception as below:
      //
      // BlockchainService Exception: 0x??? @ undefined
      // Error: Error fetching name for contract 0x7AFe30cB3E53dba6801aa0EA647A0EcEA7cBe18d
      // [getContractCallBalance] Error fetching vp for: 0x??? @ undefined with err:
      // ContractFunctionExecutionError: HTTP request failed.
      //
      // Status: 404
      // URL: https://eth-mainnet.public.blastapi.io/???
      // Request body: {"method":"eth_call","params":[{"data":"???","to":"???"},"latest"]}
      //
      // Raw Call Arguments:
      //   to:    ???
      //   data:  ???
      //
      // Contract Call:
      //   address:   ???
      //   function:  getNumberRealms(address _player)
      //   args:                     (???)
      //
      // Docs: https://viem.sh/docs/contract/readContract.html
      // Details: Not Found
      // Version: viem@1.5.0

      // don't know how to fix, just retry it.
      await new Promise(resolve => setTimeout(resolve, 2000));
      return getErc721Balance(userAddress, strategyAddress, blockTag, provider, retryCount + 1);
    }

    throw Error(`Error fetching name for contract ${strategyAddress}`);
  }
};

const getContractCallBalance = async (
  userAddress: string,
  strategyAddress: string,
  blockTag: number,
  provider: PublicClient,
  retryCount: number,
): Promise<BigNumber> => {
  const blockNumber = parseBlockTag(blockTag);
  try {
    let config = {
      address: strategyAddress as `0x{string}`,
      abi: ContractCallABI,
      functionName: 'getNumberRealms',
      args: [userAddress],
      blockNumber: blockNumber && blockNumber > 0 ? BigInt(blockNumber) : undefined,
    };
    const data = await provider.readContract(config);
    return new BigNumber(data as number);
  } catch (e) {
    console.warn(
      `[getContractCallBalance] Error fetching vp for: ${userAddress} @ ${blockTag} with err:\n${e}`,
    );

    if (retryCount < 3) {
      // There's some exception as below:
      //
      // BlockchainService Exception: 0x??? @ undefined
      // Error: Error fetching name for contract 0x7AFe30cB3E53dba6801aa0EA647A0EcEA7cBe18d
      // [getContractCallBalance] Error fetching vp for: 0x??? @ undefined with err:
      // ContractFunctionExecutionError: HTTP request failed.
      //
      // Status: 404
      // URL: https://eth-mainnet.public.blastapi.io/???
      // Request body: {"method":"eth_call","params":[{"data":"???","to":"???"},"latest"]}
      //
      // Raw Call Arguments:
      //   to:    ???
      //   data:  ???
      //
      // Contract Call:
      //   address:   ???
      //   function:  getNumberRealms(address _player)
      //   args:                     (???)
      //
      // Docs: https://viem.sh/docs/contract/readContract.html
      // Details: Not Found
      // Version: viem@1.5.0

      // don't know how to fix, just retry it.
      await new Promise(resolve => setTimeout(resolve, 2000));
      return getContractCallBalance(userAddress, strategyAddress, blockTag, provider, retryCount + 1);
    }

    throw Error(`Error fetching name for contract ${strategyAddress}`);
  }
};
