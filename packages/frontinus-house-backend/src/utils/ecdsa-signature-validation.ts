import { verifyMessage, verifyTypedData } from '@ethersproject/wallet';
import { SignedDataPayload, SignedEntity } from '../entities/signed';

/**
 * Verify the validity of an EOA signature
 * @param message The signed message
 * @param value The signed data payload
 */
export const verifyTypedDataSignature = (
  message: string,
  value: SignedEntity,
) => {
  let actualSigner: string | undefined;

  // parse reqAmount to support decimal values when signing an uint256 type
  const payload = JSON.parse(message);
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

export const verifyPersonalMessageSignature = (
  message: string,
  value: SignedEntity,
) => {
  let actualSigner: string | undefined;
  try {
    actualSigner = verifyMessage(message, value.signedData.signature);
  } catch (error) {
    return {
      isValidAccountSig: false,
      accountSigError: `EOA signature invalid. Error: ${error}`,
    };
  }

  if (actualSigner.toLowerCase() !== value.signedData.signer.toLowerCase()) {
    return {
      isValidAccountSig: false,
      accountSigError: `Incorrect EOA signer. Actual: ${actualSigner}. Expected: ${value.signedData.signer}.`,
    };
  }
  return {
    isValidAccountSig: true,
  };
};
