import { Signer, TypedDataSigner } from '@ethersproject/abstract-signer';
import { DomainSeparator, VoteMessageTypes } from '../types/eip712Types';
import {WalletClient} from 'viem';

/**
 * Signature for payload of all votes
 */
export const multiVoteSignature = async (
  signer: WalletClient,
  isContract: boolean,
  allVotesPayload: {},
  account:any
) => {

  // const address = (await signer.getAddresses())[0];


  if (isContract) return await signer.signMessage({
    account:account,
    message:JSON.stringify(allVotesPayload)
  });

  // const typedSigner = signer as Signer & TypedDataSigner;
  //return await typedSigner._signTypedData(DomainSeparator, VoteMessageTypes, allVotesPayload);

  return await signer.signTypedData({
    account,
    domain: DomainSeparator,
    types: VoteMessageTypes,
    message:allVotesPayload,
    primaryType: 'frontinus',
  });


  // return await signer.signTypedData({
  //   account,
  //   domain: {
  //     name: 'Ether Mail',
  //     version: '1',
  //     chainId: 1,
  //     verifyingContract: '0x0000000000000000000000000000000000000000',
  //   },
  //   types: {
  //     Person: [
  //       { name: 'name', type: 'string' },
  //       { name: 'wallet', type: 'address' },
  //     ],
  //     Mail: [
  //       { name: 'from', type: 'Person' },
  //       { name: 'to', type: 'Person' },
  //       { name: 'contents', type: 'string' },
  //     ],
  //   },
  //   primaryType: 'Mail',
  //   message: {
  //     from: {
  //       name: 'Cow',
  //       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
  //     },
  //     to: {
  //       name: 'Bob',
  //       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
  //     },
  //     contents: 'Hello, Bob!',
  //   },
  // });


};
