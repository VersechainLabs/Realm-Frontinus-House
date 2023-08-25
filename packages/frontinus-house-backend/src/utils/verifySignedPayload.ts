import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import { SignedEntity } from '../entities/signed';
import config from '../config/configuration';

export const verifySignPayload = (
  signedEntity: SignedEntity,
  fieldsToCheck?: string[],
) => {
  if (config().enableDebugMode) {
    return signedEntity;
  }

  const signedPayload = JSON.parse(
    Buffer.from(signedEntity.signedData.message, 'base64').toString(),
  );

  if (
    signedEntity.signedData.signer.toLowerCase() !==
    signedEntity.address.toLowerCase()
  ) {
    throw new HttpException(
      'Signature validation Failed',
      HttpStatus.BAD_REQUEST,
    );
  }

  if (fieldsToCheck) {
    for (const field of fieldsToCheck) {
      if (signedEntity[field] !== signedPayload[field]) {
        throw new HttpException(
          'Signature validation Failed',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
  return signedEntity;
};
