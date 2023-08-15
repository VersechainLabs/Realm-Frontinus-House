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
};


export class VoteStatesClass {
  code: number = 0;
  canVote: boolean = (this.code !== 200);
  reason: string = '';
}

export const VoteStates: Record<string, VoteStatesClass> = {
  OK : { code: 200, canVote: true, reason: "Can vote."},
  VOTED : { code: 311, canVote: false, reason: "You have voted for this proposal."}, // For Frontend: Show "Cancel" btn. The rest show words only.
  NOT_VOTING : { code: 312, canVote: false, reason: "Not in the eligible voting period."},
  VOTED_ANOTHER : { code: 313, canVote: false, reason: "You've already voted another proposal."},
  DELEGATE_ANOTHER : { code: 320, canVote: false, reason: "You've already delegated your voting power to someone else."},
  NO_POWER : { code: 314, canVote: false, reason: "Only Realms NFT holders have permission to approve."},
  NO_DELEGATE_POWER : { code: 321, canVote: false, reason: "Only Realms NFT holders have permission to delegate."},
  ALREADY_DELEGATED : { code: 319, canVote: false, reason: "User already delegated to another user."},

  // For Appliation only:
  NO_APPLICATION : { code: 315, canVote: false, reason: "Can not find application."},
  APPLICATION_EXIST : { code: 317, canVote: false, reason: "Your campaign profile is open to accepting delegation, so you can't delegate your voting power to others."},
  NOT_DELEGATING : { code: 318, canVote: false, reason: "Not in the eligible selection period."},
};
