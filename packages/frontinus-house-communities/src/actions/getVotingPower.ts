import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { strategyForCommunity } from '../utils/strategyForCommunity';
import {PublicClient} from "viem";

/**
 * Gets number of votes for an address given a communityAddress:
 */
export const getVotingPower = async (
  userAddress: string,
  communityAddress: string,
  provider: PublicClient,
  blockTag: number,
): Promise<number> => {
  if (!ethers.utils.isAddress(userAddress)) throw new Error('User address is not valid');
  if (!ethers.utils.isAddress(communityAddress)) throw new Error('Community address is not valid');

  // check if community has custom strategy for counting votes
  const strategy = strategyForCommunity(communityAddress);

  if (!strategy) throw new Error(`No strategy found for community address ${communityAddress}`);

  // @ts-ignore
  return await strategy(userAddress, communityAddress, blockTag, provider);
};
