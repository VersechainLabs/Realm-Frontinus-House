import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import NameABI from '../abi/NameABI.json';
import {PublicClient,getContract} from "viem";
import { readContract } from 'viem/actions';
/**
 * Gets `name` from contract (assuming it complies w the ERC721/ERC20 standard)
 */
export const getName = async (
  communityAddress: string,
  provider: PublicClient,
): Promise<string | undefined> => {
  if (!ethers.utils.isAddress(communityAddress)) throw new Error('Community address is not valid');

  // const contract = new ethers.Contract(communityAddress, NameABI, provider);

  // const contract = getContract({
  //   address: communityAddress as `0x{string}`,
  //   abi: NameABI,
  //   publicClient: provider
  // });
  //
  // const name = await contract.read.name();
  // if (!name) throw Error(`Error fetching name for contract ${communityAddress}`);
  // return name;

  const name = await provider.readContract({
    address: communityAddress as `0x{string}`,
    abi: NameABI,
    functionName: 'name'
  });

  try {
    return (name as [string])[0] as string;
  } catch (e) {
    throw Error(`Error fetching name for contract ${communityAddress}`);
  }


};
