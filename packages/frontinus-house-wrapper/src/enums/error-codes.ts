// import { VotingPower } from "frontinus-house-backend/dist/src/vote/vote.types";

export class ApplicationCreateStatus {
  code: number = 0;
  canCreate: boolean = (this.code !== 200);
  message: string = '';
}

export const ApplicationCreateStatusMap: Record<string, ApplicationCreateStatus> = {
  OK: { code: 200, canCreate: true, message: '' },
  CREATED: { code: 311, canCreate: false, message: 'You have created application in this delegation.' },
  WRONG_PERIOD: { code: 312, canCreate: false, message: 'Not in the eligible create application period.' },
  DELEGATE_TO_OTHER: { code: 313, canCreate: false, message: 'Already delegate to another in this delegation' },
  NO_VOTING_POWER: { code: 314, canCreate: false, message: 'Only Realms NFT Holder can submit application.' },
};
export const ProposalCreateStatusMap: Record<string, ApplicationCreateStatus> = {
  OK: { code: 200, canCreate: true, message: '' },
  CREATED: { code: 411, canCreate: false, message: 'You have created proposal in this round.' },
  WRONG_PERIOD: { code: 412, canCreate: false, message: 'Not in the eligible create proposal period.' },
  VOTED_TO_OTHER: { code: 413, canCreate: false, message: 'Already vote to another in this round' },
  NO_VOTING_POWER: { code: 414, canCreate: false, message: 'Only Realms NFT Holder can submit proposal.' },
  NOT_APPROVE: { code: 415, canCreate: false, message: 'Proposals cannot be created before the round is approved.' },
};


export class VoteStatesClass {
  code: number;
  canVote: boolean;
  reason: string;
  votingPower: number;

  constructor(
    code: number,
    reason: string,
    canVote?: boolean,
    votingPower?: number,
  ) {
    this.code = code;
    this.reason = reason;
    this.canVote = canVote === undefined ? this.code === 200 : canVote;
    this.votingPower = votingPower ?? 0;
  }
}

export const VoteStates: Record<string, VoteStatesClass> = {
  OK : new VoteStatesClass( 200,  "Can vote."),
  // For VOTED: Check if the current user has voted in this proposal, and if so, the frontend needs to display the "Delete Vote" button.
  // The back-end does not need that state. The back-end can vote repeatedly on the same proposal to increase its weight.
  VOTED : new VoteStatesClass( 311,  "You have voted for this proposal."),
  NOT_VOTING : new VoteStatesClass( 312,  "Not in the eligible voting period."),
  VOTED_ANOTHER : new VoteStatesClass( 313,  "Your voting power is already used up in this round."),
  DELEGATE_ANOTHER : new VoteStatesClass( 320,  "You've already delegated your voting power to someone else."),
  NO_POWER : new VoteStatesClass( 314,  "Only Realms NFT holders have permission to approve."),
  NO_DELEGATE_POWER : new VoteStatesClass( 321,  "Only Realms NFT holders have permission to delegate."),
  ALREADY_DELEGATED : new VoteStatesClass( 319,  "You've already delegated your voting power to someone else."),

  // For Application only:
  NO_APPLICATION : new VoteStatesClass( 315,  "Can not find application."),
  APPLICATION_EXIST : new VoteStatesClass( 317,  "Your campaign profile is open to accepting delegation, so you can't delegate your voting power to others."),
  NOT_DELEGATING : new VoteStatesClass( 318,  "Not in the eligible selection period."),
  NOT_LOGIN : new VoteStatesClass( 400,  "Please login."),
};