import { TypedDataDomain, WalletClient } from 'viem';
import { TypedDataField } from '@ethersproject/abstract-signer';

export abstract class Signable {
  abstract toPayload(): any;

  async typedSignature(
    signer: WalletClient,
    domainSeparator: TypedDataDomain,
    eip712MessageType: Record<string, TypedDataField[]>,
    primaryType: string,
    account: any,
  ) {
    let payload = this.toPayload();
    if (payload.hasOwnProperty('reqAmount')) payload.reqAmount = payload.reqAmount.toString();

    return await signer.signTypedData({
      account,
      domain: domainSeparator,
      types: eip712MessageType,
      message: payload,
      primaryType: primaryType,
    });
  }

  /** sign typed data */
  async signedPayload(
    signer: WalletClient,
  ) {
    const jsonPayload = this.jsonPayload();
    const address = (await signer.getAddresses())[0];

    let payload = {
      address: address,
      ...this.toPayload(),
    };
    const signMessage = JSON.stringify(payload);
    const signature = await signer.signMessage({
      account: address,
      message: signMessage,
    });
    if (!signature) throw new Error(`Error signing payload.`);
    return {
      signedData: {
        message: Buffer.from(signMessage).toString('base64'),
        signature: signature,
        signer: address,
      },
      owner: address,
      ...payload,
    };
  }

  jsonPayload() {
    return JSON.stringify(this.toPayload());
  }
}

export class TimedAuction extends Signable {
  constructor(
    public readonly visible: boolean,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly proposalEndTime: Date,
    public readonly votingEndTime: Date,
    public readonly fundingAmount: number,
    public readonly currencyType: string,
    public readonly numWinners: number,
    public readonly community: number,
    public readonly communityId: number,
    public readonly balanceBlockTag: number,
    public readonly description: string,
  ) {
    super();
  }

  toPayload() {
    return {
      visible: this.visible,
      title: this.title,
      startTime: this.startTime.toISOString(),
      proposalEndTime: this.proposalEndTime.toISOString(),
      votingEndTime: this.votingEndTime.toISOString(),
      fundingAmount: this.fundingAmount,
      currencyType: this.currencyType,
      numWinners: this.numWinners,
      community: this.community,
      communityId: this.communityId,
      balanceBlockTag: this.balanceBlockTag,
      description: this.description,
    };
  }
}

export class TimedDelegate extends Signable {
  constructor(
    public readonly title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly proposalEndTime: Date,
    public readonly votingEndTime: Date,
    public readonly description: string,
  ) {
    super();
  }

  toPayload() {
    return {
      title: this.title,
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      proposalEndTime: this.proposalEndTime.toISOString(),
      votingEndTime: this.votingEndTime.toISOString(),
      description: this.description,
    };
  }
}

export class ApproveRound extends Signable {
  constructor(
      public readonly id: number,
      public readonly visibleStatus: number,
  ) {
    super();
  }

  toPayload() {
    return {
      id: this.id,
      visibleStatus: this.visibleStatus,
    };
  }
}

export class StoredTimedAuction extends TimedAuction {
  //@ts-ignore
  public readonly id: number;
  //@ts-ignore
  public readonly numProposals: number;
  //@ts-ignore
  public readonly createdDate: Date;

  static FromResponse(response: any): StoredTimedAuction {
    const parsed = {
      ...response,
      startTime: new Date(response.startTime),
      proposalEndTime: new Date(response.proposalEndTime),
      votingEndTime: new Date(response.votingEndTime),
    };
    return parsed;
  }
}

export class InfiniteAuction extends Signable {
  constructor(
    public readonly visible: boolean,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly fundingAmount: number,
    public readonly currencyType: string,
    public readonly communityId: number,
    public readonly balanceBlockTag: number,
    public readonly description: string,
    public readonly quorum: number,
    public readonly votingPeriod: number,
  ) {
    super();
  }

  toPayload() {
    return {
      visible: this.visible,
      title: this.title,
      startTime: this.startTime.toISOString(),
      fundingAmount: this.fundingAmount,
      currencyType: this.currencyType,
      communityId: this.communityId,
      balanceBlockTag: this.balanceBlockTag,
      description: this.description,
      quorum: this.quorum,
      votingPeriod: this.votingPeriod,
    };
  }
}

export class StoredInfiniteAuction extends InfiniteAuction {
  //@ts-ignore
  public readonly id: number;
  //@ts-ignore
  public readonly numProposals: number;
  //@ts-ignore
  public readonly createdDate: Date;

  static FromResponse(response: any): StoredTimedAuction {
    const parsed = {
      ...response,
      startTime: new Date(response.startTime),
    };
    return parsed;
  }
}

export class StoredPendingAuction extends InfiniteAuction {
  //@ts-ignore
  public readonly visibleStatus: number;
  //@ts-ignore
  public readonly id: number;
  //@ts-ignore
  public readonly numProposals: number;
  //@ts-ignore
  public readonly createdDate: Date;

  static FromResponse(response: any): StoredTimedAuction {
    const parsed = {
      ...response,
      startTime: new Date(response.startTime),
    };
    return parsed;
  }
}

export type AuctionBase = TimedAuction | InfiniteAuction;
export type StoredAuctionBase = StoredTimedAuction | StoredInfiniteAuction | StoredPendingAuction;

export type ProposalParent = 'auction' | 'infinite-auction';

export class Proposal extends Signable {
  constructor(
    public readonly title: string,
    public readonly what: string,
    public readonly tldr: string,
    public readonly auctionId: number,
    public readonly parentType: ProposalParent = 'auction',
  ) {
    super();
  }

  toPayload() {
    return {
      title: this.title,
      what: this.what,
      tldr: this.tldr,
      parentAuctionId: this.auctionId,
      parentType: this.parentType,
    };
  }
}


export class Application extends Signable {
  constructor(
      public readonly title: string,
      public readonly description: string,
      public readonly tldr: string,
      public readonly delegationId: number,
      public readonly parentType: ProposalParent = 'auction',
  ) {
    super();
  }

  toPayload() {
    return {
      title: this.title,
      description: this.description,
      tldr: this.tldr,
      delegationId: this.delegationId,
      parentType: this.parentType,
    };
  }
}


export class UpdatedProposal extends Proposal {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly what: string,
    public readonly tldr: string,
    public readonly auctionId: number,
    public readonly reqAmount: number | null,
    public readonly parentType: ProposalParent = 'auction',
  ) {
    super(title, what, tldr, auctionId, parentType);
  }

  toPayload() {
    return {
      id: this.id,
      reqAmount: this.reqAmount,
      ...super.toPayload(),
    };
  }
}

export class InfiniteAuctionProposal extends Signable {
  constructor(
    public readonly title: string,
    public readonly what: string,
    public readonly tldr: string,
    public readonly auctionId: number,
    public readonly reqAmount: number,
    public readonly parentType: ProposalParent = 'infinite-auction',
  ) {
    super();
  }

  toPayload() {
    return {
      title: this.title,
      what: this.what,
      tldr: this.tldr,
      parentAuctionId: this.auctionId,
      parentType: this.parentType,
      reqAmount: this.reqAmount,
    };
  }
}

export interface StoredProposal extends Proposal {
  id: number;
  address: string;
  createdDate: Date;
  voteCount: number;
  lastUpdatedDate: Date;
  deletedAt: Date;
  reqAmount: number | null;
  voteState: {
    canVote: boolean;
    code: number;
    reason: string;
  }
  canVote: boolean;
  disallowedVoteReason: string | null;
}

export interface StoredProposalWithVotes extends StoredProposal {
  votes: StoredVote[];
}

export class DeleteProposal extends Signable {
  constructor(public readonly id: number) {
    super();
  }

  toPayload() {
    return {
      id: this.id,
    };
  }
}

export class DeleteApplication extends Signable {
  constructor(public readonly id: number) {
    super();
  }

  toPayload() {
    return {
      applicationId: this.id,
    };
  }
}

export enum Direction {
  Up = 1,
  Down = -1,
  Abstain = 0,
}

export enum SignatureState {
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  FAILED_VALIDATION = 'FAILED_VALIDATION',
  VALIDATED = 'VALIDATED',
}

export class Vote extends Signable {
  constructor(
    // public readonly direction: Direction,
    public readonly proposalId: number,
  ) {
    super();
  }

  toPayload() {
    return {
      // No need direction
      // direction: this.direction,
      proposalId: this.proposalId,
    };
  }
}

export class DeleteVote extends Signable {
  constructor(
      public readonly proposalId: number,
  ) {
    super();
  }

  toPayload() {
    return {
      // No need direction
      // direction: this.direction,
      proposalId: this.proposalId,
    };
  }
}

export interface StoredVote extends Vote {
  address: string;
  signedData: string;
  id: number;

  weight: number,
  actualWeight: number,
  delegateId: number,
  delegateList: StoredVote[],
}

export interface StoredVoteWithProposal extends StoredVote {
  proposal: StoredProposal;
}

export interface StoredFile {
  id: number;
  hidden: boolean;
  address: string;
  name: string;
  mimeType: string;
  ipfsHash: string;
  pinSize: string;
  ipfsTimestamp: string;
  createdDate: string;
}

export class Community extends Signable {
  constructor(
    public readonly id: number,
    public readonly contractAddress: string,
    public readonly name: string,
    public readonly profileImageUrl: string,
    public readonly numAuctions: number,
    public readonly numProposals: number,
    public readonly ethFunded: number,
    public readonly totalFunded: number,
    public readonly description: number,
  ) {
    super();
  }

  toPayload() {
    return {
      id: this.id,
      contractAddress: this.contractAddress,
      name: this.name,
      profileImageUrl: this.profileImageUrl,
      numAuctions: this.numAuctions,
      numProposals: this.numProposals,
      ethFunded: this.ethFunded,
      totalFunded: this.totalFunded,
      description: this.description,
    };
  }
}

export class Comment extends Signable {
  constructor(
    public readonly content: string,
    public readonly proposalId?: number,
    public readonly applicationId?: number,
  ) {
    super();
  }

  toPayload(): any {
    return {
      content: this.content,
      proposalId: this.proposalId,
      applicationId: this.applicationId,
    };
  }
}

export interface StoredComment extends Comment {
  id: number;
  address: string;
  createdDate: string;
}

export interface CommunityWithAuctions extends Community {
  auctions: StoredTimedAuction[];
}