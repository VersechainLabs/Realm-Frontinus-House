import { ethers } from 'ethers';
import NameABI from '../abi/NameABI.json';
import { PublicClient } from 'viem';

/**
 * Gets `name` from contract (assuming it complies w the ERC721/ERC20 standard)
 */
export const getName = async (
  communityAddress: string,
  provider: PublicClient,
): Promise<string | undefined> => {
  if (!ethers.utils.isAddress(communityAddress)) throw new Error('Community address is not valid');

  const name = await provider.readContract({
    address: communityAddress as `0x{string}`,
    abi: NameABI,
    functionName: 'name',
  });

  try {
    return (name as [string])[0];
  } catch (e) {
    throw Error(`Error fetching name for contract ${communityAddress}`);
  }
};
