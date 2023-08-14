import { CreateVoteDto } from '../vote/vote.types';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import { SignedEntity } from '../entities/signed';
import config from '../config/configuration';

export const verifySignPayloadForVote = (createVoteDto: CreateVoteDto) => {
  if (config().enableDebugMode) {
    return createVoteDto;
  }

  const signedPayload = JSON.parse(
    Buffer.from(createVoteDto.signedData.message, 'base64').toString(),
  );

  if (
    createVoteDto.signedData.signer.toLowerCase() !==
    createVoteDto.address.toLowerCase()
  ) {
    throw new HttpException(
      'Signature validation Failed',
      HttpStatus.BAD_REQUEST,
    );
  }

  if (signedPayload.proposalId !== createVoteDto.proposalId) {
    throw new HttpException(
      'Signature validation Failed',
      HttpStatus.BAD_REQUEST,
    );
  }

  return createVoteDto;
};

export const verifySignPayload = (
  signedEntity: SignedEntity,
  fieldsToCheck?: string[],
) => {
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
