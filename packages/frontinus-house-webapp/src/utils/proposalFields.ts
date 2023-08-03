import { StoredProposal } from '@nouns/frontinus-house-wrapper/dist/builders';

export interface ProposalFields {
  title: string;
  what: string;
  tldr: string;
  reqAmount: number | null;
}

const proposalFields = (proposal: any): ProposalFields => ({
  title: proposal.title,
  what: proposal.what ? proposal.what : proposal.description,
  tldr: proposal.tldr ,
  reqAmount: proposal.reqAmount,
});

export default proposalFields;
