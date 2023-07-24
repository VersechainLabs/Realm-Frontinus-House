import { Proposal } from 'src/proposal/proposal.entity';
import { CreateVoteDto } from 'src/vote/vote.types';

export const verifySignPayloadForVote = (
  createVoteDto: CreateVoteDto,
  proposal: Proposal,
) => {
  return createVoteDto;
  // TODO: validate signature
  // const signedPayload = JSON.parse(
  //   Buffer.from(createVoteDto.signedData.message, 'base64').toString(),
  // );
};
