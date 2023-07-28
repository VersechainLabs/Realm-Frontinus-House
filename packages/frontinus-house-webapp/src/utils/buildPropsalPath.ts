import { Community, AuctionBase } from '@nouns/frontinus-house-wrapper/dist/builders';
import { nameToSlug } from './communitySlugs';

/**
 * build url path to proposal (/:community-name/:round-name/:proposal-id)
 */
export const buildProposalPath = (community: Community, round: AuctionBase, propId: number) =>
  `https://prop.house/${nameToSlug(community.name)}/${nameToSlug(round.title)}/${propId}`;
