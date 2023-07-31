import { StoredProposal } from "@nouns/frontinus-house-wrapper/dist/builders";
import firstOrNull from "./firstOrNull";

export const findProposalById = (id: number, proposals: StoredProposal[]) =>
  firstOrNull(proposals.filter((p) => p.id === id));
