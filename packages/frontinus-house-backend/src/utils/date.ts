import { AuctionBase } from '../auction/auction-base.type';
import { Auction } from '../auction/auction.entity';

export const ParseDate = (str) => new Date(str);

export const canSubmitProposals = (auction: AuctionBase): boolean =>
  auction.isAcceptingProposals();
