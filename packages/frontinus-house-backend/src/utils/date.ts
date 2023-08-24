import { Delegation } from 'src/delegation/delegation.entity';
import { AuctionBase } from '../auction/auction-base.type';
import { Auction } from '../auction/auction.entity';

export const ParseDate = (str) => new Date(str);

export const canSubmitProposals = (auction: AuctionBase): boolean =>
  auction.isAcceptingProposals();

export const canSubmitApplications = (delegation: Delegation): boolean =>
  delegation.isAcceptingApplications();
