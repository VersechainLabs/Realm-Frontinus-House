import { Provider } from '@ethersproject/providers';
import {PublicClient,getContract} from "viem";

export type Strategy = (
  userAddress: string,
  communityAddress: string,
  blockTag: number,
  provider: PublicClient,
) => Promise<number>;
