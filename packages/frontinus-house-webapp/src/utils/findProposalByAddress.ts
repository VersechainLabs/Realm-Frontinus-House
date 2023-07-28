import { StoredProposal } from '@nouns/frontinus-house-wrapper/dist/builders';
import firstOrNull from './firstOrNull';

export const findProposalByAddress = (address: string, proposals: StoredProposal[]) =>
  firstOrNull(proposals.filter(p => p.address === address));
