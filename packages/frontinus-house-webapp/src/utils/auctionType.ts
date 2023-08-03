import {
  AuctionBase,
  StoredAuctionBase,
  StoredInfiniteAuction,
  StoredTimedAuction,
} from '@nouns/frontinus-house-wrapper/dist/builders';

export const isInfAuction = (
  auction: StoredAuctionBase | AuctionBase | any,
): auction is StoredInfiniteAuction => 'quorum' in auction;

export const isTimedAuction = (
  auction: StoredAuctionBase | AuctionBase | any,
): auction is StoredTimedAuction => !('quorum' in auction);
