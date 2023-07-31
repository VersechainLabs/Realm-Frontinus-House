import { StoredTimedAuction } from '@nouns/frontinus-house-wrapper/dist/builders';
import isAuctionActive from './isAuctionActive';

/**
 * Auction is not accepting proposals
 */
const isAuctionClosed = (auction: StoredTimedAuction) => !isAuctionActive(auction);

export default isAuctionClosed;
