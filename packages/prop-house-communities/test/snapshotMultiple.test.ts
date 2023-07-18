import { expect } from 'chai';
import { providers } from 'ethers';
import { blastApiEndpoint } from './src/constants/infuraEndpoint';
import { communities } from '../src/communities';

describe('Snapshot multiple strategy', () => {
  const provider = new providers.JsonRpcProvider(blastApiEndpoint);
  const communityAddress = '0x7AFe30cB3E53dba6801aa0EA647A0EcEA7cBe18d';
  const strategy = communities.get(communityAddress);
  if (!strategy) {
    throw Error('strategy undefined');
  }

  it('test', async () => {
    const votingPower = await strategy('0x1a5e02a0a85118c3382fa3c161cb78110f97299a', communityAddress, 17665082, provider);
    console.log(`voting power : ${votingPower}`);
    expect(votingPower).to.eq(18);
  });


  it('test', async () => {
    const votingPower = await strategy('0x1a5e02a0a85118c3382fa3c161cb78110f97299a', communityAddress, 17665081, provider);
    console.log(`voting power : ${votingPower}`);
    expect(votingPower).to.eq(16);
  });

  it('test', async () => {
    const votingPower = await strategy('0x1a5e02a0a85118c3382fa3c161cb78110f97299a', communityAddress, 17657017, provider);
    console.log(`voting power : ${votingPower}`);
    expect(votingPower).to.eq(16);
  });


  it('test', async () => {
    const votingPower = await strategy('0x1a5e02a0a85118c3382fa3c161cb78110f97299a', communityAddress, 17657000, provider);
    console.log(`voting power : ${votingPower}`);
    expect(votingPower).to.eq(14);
  });
});