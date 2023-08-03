import { PublicClient } from 'viem';

/**
 * Gets number of votes for an address given a communityAddress:
 */
export const getCurrentBlockNum = async (
  provider: PublicClient,
): Promise<number> => {
  return provider.getBlockNumber().then((n) => Number(n));
};
