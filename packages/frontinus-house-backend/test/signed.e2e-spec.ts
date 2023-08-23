import { createWalletClient, http, LocalAccount, WalletClient } from 'viem';
import { mnemonicToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';
import { verifySignPayload } from '../src/utils/verifySignedPayload';
import { SignedEntity } from '../src/entities/signed';
import { SignedPayloadValidationPipe } from '../src/entities/signed.pipe';
import * as process from 'process';

const mnemonic =
  'test test test test test test test test test test test account';
const address = '0xDC9D4D5D73CC0A7181383928664DB68Eb87b0e14';

const signedPayload = async (signer: WalletClient, data: any) => {
  const payload = {
    address: address,
    ...data,
  };
  const signMessage = JSON.stringify(payload);
  const signature = await (signer.account as LocalAccount).signMessage({
    message: signMessage,
  });
  if (!signature) throw new Error(`Error signing payload.`);
  return {
    signedData: {
      message: Buffer.from(signMessage).toString('base64'),
      signature: signature,
      signer: address,
    },
    owner: address,
    ...payload,
  };
};

describe('Test Wallet Signature', () => {
  const account = mnemonicToAccount(mnemonic);
  const walletClient = createWalletClient({
    account,
    chain: mainnet,
    transport: http(),
  });

  let param = {
    title: 'test proposal title',
    what: '<p>The proposal content</p>',
    tldr: 'too long, dont read',
    parentAuctionId: 85,
    parentType: 'auction',
  };

  // param = JSON.parse('');

  it('Success signature validation', async () => {
    expect(walletClient.account.address).toBe(address);

    const result = await signedPayload(walletClient, param);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

    const pipe = new SignedPayloadValidationPipe();
    expect(() => pipe.transform(result)).not.toThrowError();

    expect(() =>
      verifySignPayload(result as SignedEntity, Object.keys(param)),
    ).not.toThrowError();
  });

  it('Signature pipe should throw exception', async () => {
    const result = await signedPayload(walletClient, param);
    result.signedData.signer = '0xDC9D4D5D73CC0A7181383928664DB68Eb87b0e13';

    const pipe = new SignedPayloadValidationPipe();
    let err;
    try {
      await pipe.transform(result);
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });

  it('verifySignPayload should throw exception', async () => {
    const result = await signedPayload(walletClient, param);
    result[Object.keys(param)[0]] = 'WRONG_VALUE';
    let err;
    try {
      verifySignPayload(result, Object.keys(param));
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });
});
