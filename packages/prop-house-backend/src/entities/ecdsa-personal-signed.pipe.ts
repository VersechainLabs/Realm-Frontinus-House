import { PipeTransform, Injectable } from '@nestjs/common';
import { SignatureState } from 'src/types/signature';
import { verifyAccountSignature, verifyPersonalMessageSignature } from 'src/utils';
import { SignedEntity } from './signed';

@Injectable()
export class ECDSAPersonalSignedPayloadValidationPipe implements PipeTransform {
  /**
   * Verifies that a signed data payload has a valid signature and matches the address in the payload
   */
  transform(value: SignedEntity) {
    const { isValidAccountSig, accountSigError } = verifyPersonalMessageSignature(
      value.signedData,
    );
    if (!isValidAccountSig) {
      throw new Error(accountSigError);
    }
    return {
      ...value,
      signatureState: SignatureState.VALIDATED,
    };
  }
}
