import { Provider } from '@ethersproject/providers';

// Just for test: return a 1-10 random voting power by blocknum & useraddress.
// Won't change when block tag and user address not change.
export const mockRandomByBlock = () => {
  return async (userAddress: string, communityAddress: string, blockTag: number, provider: Provider) => {
    return (blockTag % 10 + Number(BigInt(userAddress) % BigInt(10))) % 10;
  };
};