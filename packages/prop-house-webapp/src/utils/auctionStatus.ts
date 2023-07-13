import { StoredAuctionBase, StoredTimedAuction } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';
import { isInfAuction } from './auctionType';

export enum AuctionStatus {
  AuctionNotStarted,
  AuctionAcceptingProps,
  AuctionVoting,
  AuctionEnded,
}

export enum DelegateVoteStatus {
  AuctionNotStarted,
  AuctionNominating,
  AuctionVoting,
  AuctionEnded,
}

/**
 * Calculates auction state
 * @param auction Auction to check status of.
 */
export const auctionStatus = (auction: StoredAuctionBase): AuctionStatus => {
  const _now = dayjs();
  const _auctionStartTime = dayjs(auction.startTime);

  if (_now.isBefore(_auctionStartTime)) return AuctionStatus.AuctionNotStarted;
  if (isInfAuction(auction)) return AuctionStatus.AuctionAcceptingProps;

  const _proposalEndTime = dayjs(auction.proposalEndTime);
  const _votingEndTime = dayjs(auction.votingEndTime);

  switch (true) {
    case _now.isBefore(_auctionStartTime):
      return AuctionStatus.AuctionNotStarted;
    case _now.isAfter(_auctionStartTime) && _now.isBefore(_proposalEndTime):
      return AuctionStatus.AuctionAcceptingProps;
    case _now.isAfter(_proposalEndTime) && _now.isBefore(_votingEndTime):
      return AuctionStatus.AuctionVoting;
    case _now.isAfter(_votingEndTime):
      return AuctionStatus.AuctionEnded;
    default:
      return AuctionStatus.AuctionEnded;
  }
};

/**
 * Returns copy for deadline corresponding to auction status
 */
export const deadlineCopy = (auction: StoredAuctionBase) => {
  const status = auctionStatus(auction);
  return status === AuctionStatus.AuctionNotStarted
    ? 'Round starts'
    : status === AuctionStatus.AuctionAcceptingProps
    ? 'Prop deadline'
    : status === AuctionStatus.AuctionVoting
    ? 'Voting ends'
    : status === AuctionStatus.AuctionEnded
    ? 'Round ended'
    : '';
};

/**
 * Returns deadline date for corresponding to auction status
 */
export const deadlineTime = (auction: any) =>
  auctionStatus(auction) === AuctionStatus.AuctionNotStarted
    ? auction.startTime
    : auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps
    ? auction.proposalEndTime
    : auction.votingEndTime;



export const delegateStatus = (auction: any): DelegateVoteStatus => {
  const _now = dayjs();
  const _auctionStartTime = dayjs(auction.startTime);
  const _auctionEndTime = dayjs(auction.endTime);

  // if (_now.isBefore(_auctionStartTime)) return DelegateVoteStatus.AuctionNotStarted;
  //
  const _proposalEndTime = dayjs(auction.proposalEndTime);
  const _votingEndTime = dayjs(auction.votingEndTime);

  switch (true) {
    case _now.isBefore(_auctionStartTime):
      return DelegateVoteStatus.AuctionNotStarted;
    case _now.isAfter(_auctionStartTime) && _now.isBefore(_proposalEndTime):
      return DelegateVoteStatus.AuctionNominating;
    case _now.isAfter(_proposalEndTime) && _now.isBefore(_votingEndTime):
      return DelegateVoteStatus.AuctionVoting;
    case _now.isAfter(_auctionEndTime):
      return DelegateVoteStatus.AuctionEnded;
    default:
      return DelegateVoteStatus.AuctionEnded;
  }
};


/**
 * Returns copy for deadline corresponding to auction status
 */
export const delegateDeadlineCopy = (auction: any) => {
  const status = delegateStatus(auction);
  return status === DelegateVoteStatus.AuctionNotStarted
      ? 'Round starts'
      : status === DelegateVoteStatus.AuctionNominating
          ? 'Prop deadline'
          : status === DelegateVoteStatus.AuctionVoting
              ? 'Voting ends'
              : status === DelegateVoteStatus.AuctionEnded
                  ? 'Round ended'
                  : '';
};

export const delegateDeadlineTime = (auction: any) =>
    delegateStatus(auction) === DelegateVoteStatus.AuctionNotStarted
        ? auction.startTime
        : delegateStatus(auction) === DelegateVoteStatus.AuctionNominating
        ? auction.proposalEndTime
        : auction.votingEndTime;