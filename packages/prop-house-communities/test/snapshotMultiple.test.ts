import { expect } from 'chai';
import { providers } from 'ethers';
import { blastApiEndpoint } from './src/constants/infuraEndpoint';
import { communities } from '../src/communities';

describe('Snapshot multiple strategy', () => {
  const provider = new providers.JsonRpcProvider(blastApiEndpoint);
  before('web3 provider should be available', async () => {
    const network = await provider.ready;
    expect(network.chainId).to.eq(1);
  });

  // snapshot strategy define: https://snapshot.org/#/council.bibliotheca.eth/proposal/0x755fc15017bc4a061e385c3fe4cd65b9e39496ba028577b4828c3a3f8dc4b71f
  // check for the second strategy
  const communityAddress = '0x7AFe30cB3E53dba6801aa0EA647A0EcEA7cBe18d';
  const strategy = communities.get(communityAddress);
  if (!strategy) {
    throw Error('strategy undefined');
  }

  it('Get the newest balance', async () => {
    const ownerAddress = '0x1a5e02a0a85118c3382fa3c161cb78110f97299a';
    const votingPower = await strategy(ownerAddress, communityAddress, 0, provider);
    expect(votingPower).to.gte(0);
  });

  it('Check the specific block is correct', async () => {
    // This guy transferred two Realms NFT at 17665082: https://etherscan.io/tx/0x4c34107aea6a21a82e4d44e3a837686b58c71eebed812fa133618e001e913d0d
    const ownerAddress = '0x1a5e02a0a85118c3382fa3c161cb78110f97299a';
    let votingPower = await strategy(ownerAddress, communityAddress, 17665082, provider);
    expect(votingPower).to.eq(18);

    votingPower = await strategy(ownerAddress, communityAddress, 17665081, provider);
    expect(votingPower).to.eq(16);
  });
});