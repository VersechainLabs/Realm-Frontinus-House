import { PublicClient } from "viem";
import { log } from "../utils/log";

/**
 * Gets number of votes for an address given a communityAddress:
 */
export const getCurrentBlockNum = async (provider: PublicClient): Promise<number> => {
  log('getBlockNum', ``);
  return _getCurrentBlockNum(provider, 0);
};

const _getCurrentBlockNum = async (provider: PublicClient, retryCount: number): Promise<number> => {
  try {
    return provider.getBlockNumber().then(n => Number(n));
  } catch (e) {
    log('getBlockNum', `Error. retry=${retryCount}. with err:\n${e}\n`);
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return _getCurrentBlockNum(provider, retryCount + 1);
    } else {
      throw Error('Error fetching block number');
    }
  }
};
