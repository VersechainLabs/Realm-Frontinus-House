import { StoredAuctionBase, StoredTimedAuction } from '@nouns/frontinus-house-wrapper/dist/builders';
import dayjs from 'dayjs';
import { isInfAuction } from './auctionType';
import diffTime from "./diffTime";

export enum AuctionStatus {
  AuctionNotStarted,
  AuctionAcceptingProps,
  AuctionVoting,
  AuctionEnded,
  Pending,
  Normal,
}

export enum DelegateVoteStatus {
  DelegateNotStarted,
  DelegateAccepting,
  DelegateDelegating,
  DelegateGranted,
  DelegateEnd
}

/**
 * Calculates auction state
 * @param auction Auction to check status of.
 */
export const auctionStatus = (auction: StoredAuctionBase,flag = false): AuctionStatus => {
  if (!flag && auction.hasOwnProperty('visibleStatus') && auction.visibleStatus == 0) {
    return AuctionStatus.Pending;
  }
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

export const auctionPendingStatus = (auction: StoredAuctionBase): AuctionStatus => {
  if (auction.hasOwnProperty('visibleStatus') && auction.visibleStatus == 0) {
    return AuctionStatus.Pending;
  }else {
    return AuctionStatus.Normal;
  }
};

/**
 * Returns copy for deadline corresponding to auction status
 */
export const deadlineCopy = (auction: StoredAuctionBase) => {
  const status = auctionStatus(auction,true);
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

export const deadlineBipTime = (auction: any) =>
    auction.votingPeriod=='Ended'
        ? auction.endTime
        : auction.startTime;



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
      return DelegateVoteStatus.DelegateNotStarted;
    case _now.isAfter(_auctionStartTime) && _now.isBefore(_proposalEndTime):
      return DelegateVoteStatus.DelegateAccepting;
    case _now.isAfter(_proposalEndTime) && _now.isBefore(_votingEndTime):
      return DelegateVoteStatus.DelegateDelegating;
    case _now.isAfter(_votingEndTime) && _now.isBefore(_auctionEndTime):
      return DelegateVoteStatus.DelegateGranted;
    case _now.isAfter(_auctionEndTime):
      return DelegateVoteStatus.DelegateEnd;
    default:
      return DelegateVoteStatus.DelegateEnd;
  }
};


/**
 * Returns copy for deadline corresponding to auction status
 */
export const delegateDeadlineCopy = (auction: any) => {
  const status = delegateStatus(auction);
  return status === DelegateVoteStatus.DelegateNotStarted
      ? 'Open to accept applicant'
      : status === DelegateVoteStatus.DelegateAccepting
          ? 'Submission Deadline'
              : status === DelegateVoteStatus.DelegateDelegating
                  ? 'Selection Deadline'
                : status === DelegateVoteStatus.DelegateGranted
                    ? 'Delegation ends'
                    : status === DelegateVoteStatus.DelegateEnd
                        ? 'Delegation ended'
                        : '';
};

export const delegateDeadlineTime = (auction: any) =>

    delegateStatus(auction) === DelegateVoteStatus.DelegateNotStarted
    ? auction.startTime
    : delegateStatus(auction) === DelegateVoteStatus.DelegateAccepting
        ? auction.proposalEndTime
        : delegateStatus(auction) === DelegateVoteStatus.DelegateDelegating
            ? auction.votingEndTime
            : delegateStatus(auction) === DelegateVoteStatus.DelegateGranted
                ? auction.endTime
                : delegateStatus(auction) === DelegateVoteStatus.DelegateEnd
                    ? auction.endTime
                    : auction.endTime;

