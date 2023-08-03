import { SignatureState, StoredVote } from '@nouns/frontinus-house-wrapper/dist/builders';

/**
 * Counts total number of validated `vote.weight` from `votes` for proposal
 */
export const countNumVotesForProp = (votes: StoredVote[], proposalId: number) =>
  votes
    .reduce((prev, current) => prev + Number(current.weight), 0);
