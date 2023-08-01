import { communities } from '../communities';
// import { Provider } from '@ethersproject/providers';
import {PublicClient} from "viem";

/**
 * Looks up community where user has voting power
 */
export const getRelevantComms = async (
  userAddress: string,
  provider: PublicClient,
  blockTag: number,
): Promise<{ [key: string]: number }> => {
  const allVotes = await Promise.all(
    Array.from(communities).map(async comm => {
      try {
        // @ts-ignore
          return await comm[1](userAddress, comm[0], blockTag, provider);
      } catch (e) {
        console.log(`Error resolving voting power for community ${comm[0]}: ${e}`);
        return 0;
      }
    }),
  );

  // map community addresses to votes
  const nonZeroVoteCommunities = Array.from(communities.keys())
    .map((address, index) => ({ [address]: allVotes[index] }))
    .filter(obj => Object.values(obj)[0] !== 0)
    .reduce((accumulator, current) => ({ ...accumulator, ...current }), {});

  return nonZeroVoteCommunities;
};
