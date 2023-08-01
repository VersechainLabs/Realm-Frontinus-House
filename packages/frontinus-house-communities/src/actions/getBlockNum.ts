import { Provider } from '@ethersproject/providers';

/**
 * Gets number of votes for an address given a communityAddress:
 */
export const getCurrentBlockNum = async (
  provider: Provider,
): Promise<number> => {
  return provider.getBlockNumber();
};
