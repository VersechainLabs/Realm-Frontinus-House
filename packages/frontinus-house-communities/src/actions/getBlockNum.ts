import { PublicClient } from "viem";

/**
 * Gets number of votes for an address given a communityAddress:
 */
export const getCurrentBlockNum = async (provider: PublicClient): Promise<number> => {
  return _getCurrentBlockNum(provider, 0);
};

const _getCurrentBlockNum = async (provider: PublicClient, retryCount: number): Promise<number> => {
  try {
    return provider.getBlockNumber().then(n => Number(n));
  } catch (e) {
    console.warn(
      `[getErc721Balance] Error fetching block number. retry=${retryCount}. with err:\n${e}`,
    );

    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return _getCurrentBlockNum(provider, retryCount + 1);
    } else {
      throw Error('Error fetching block number');
    }
  }
};
