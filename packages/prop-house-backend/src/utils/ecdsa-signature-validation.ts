import { verifyTypedData } from '@ethersproject/wallet';
import { SignedDataPayload, SignedEntity } from 'src/entities/signed';
import { verifyMessage } from '@ethersproject/wallet/src.ts';

/**
 * Verify the validity of an EOA signature
 * @param message The signed message
 * @param value The signed data payload
 */
export const verifyAccountSignature = (
  message: string,
  value: SignedEntity,
) => {
  let actualSigner: string | undefined;

  // parse reqAmount to support decimal values when signing an uint256 type
  let payload = JSON.parse(message);
  if (payload.hasOwnProperty('reqAmount'))
    payload.reqAmount = payload.reqAmount.toString();

  try {
    actualSigner = verifyTypedData(
      value.domainSeparator,
      value.messageTypes,
      payload,
      value.signedData.signature,
    );
  } catch (error) {
    return {
      isValidAccountSig: false,
      accountSigError: `EOA signature invalid. Error: ${error}`,
    };
  }

  if (actualSigner.toLowerCase() !== value.address.toLowerCase()) {
    return {
      isValidAccountSig: false,
      accountSigError: `Incorrect EOA signer. Actual: ${actualSigner}. Expected: ${value.address}.`,
    };
  }
  return {
    isValidAccountSig: true,
  };
};

export const verifyPersonalMessageSignature = (signDataPayload: SignedDataPayload) => {
  let actualSigner: string | undefined;
  try {
    actualSigner = verifyMessage(signDataPayload.message, signDataPayload.signature);
  } catch (error) {
    return {
      isValidAccountSig: false,
      accountSigError: `EOA signature invalid. Error: ${error}`,
    };
  }

  if (actualSigner.toLowerCase() !== signDataPayload.signer.toLowerCase()) {
    return {
      isValidAccountSig: false,
      accountSigError: `Incorrect EOA signer. Actual: ${actualSigner}. Expected: ${signDataPayload.signer}.`,
    };
  }
  return {
    isValidAccountSig: true,
  };
};