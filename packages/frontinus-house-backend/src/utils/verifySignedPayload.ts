import { Proposal } from '../proposal/proposal.entity';
import { CreateVoteDto } from '../vote/vote.types';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';

export const verifySignPayloadForVote = (createVoteDto: CreateVoteDto) => {
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
