import { SignatureState, StoredVote } from '@nouns/prop-house-wrapper/dist/builders';

/**
 * Counts total number of validated `vote.weight` from `votes`
 */
export const countNumVotes = (votes: StoredVote[]) =>
  votes
    .reduce((prev, current) => prev + Number(current.weight), 0);
