import axios from 'axios';
import {
  Application, ApproveRound, BIPVote,
  Comment,
  Community,
  CommunityWithAuctions, DeleteApplication, DeleteBIPVote,
  DeleteProposal, DeleteVote,
  Proposal, ProposalParent,
  StoredAuctionBase,
  StoredComment,
  StoredFile,
  StoredInfiniteAuction,
  StoredTimedAuction,
  StoredTimedBIP,
  StoredVote,
  StoredVoteWithProposal,
  TimedAuction, TimedBIP, TimedDelegate,
  UpdatedProposal,
  Vote,
} from './builders';
import FormData from 'form-data';
import * as fs from 'fs';
import {
  DeleteApplicationMessageTypes,
  DeleteProposalMessageTypes,
  EditProposalMessageTypes,
  InfiniteAuctionProposalMessageTypes,
  TimedAuctionProposalMessageTypes,
} from './types/eip712Types';
import { WalletClient } from 'viem';

export * from './enums';

export class ApiWrapper {
  constructor(
    private readonly host: string,
    private readonly signer: WalletClient | null | undefined = undefined,
  ) {
  }

  async createAuction(auction: TimedAuction): Promise<StoredTimedAuction[]> {
    if (!this.signer) throw 'Please sign';
    try {
      const signedPayload = await auction.signedPayload(this.signer);
      return (await axios.post(`${this.host}/auctions/create`, signedPayload)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async createBIP(bip:TimedBIP ): Promise<StoredTimedBIP[]> {
    if (!this.signer) throw 'Please sign';
    try {
      const signedPayload = await bip.signedPayload(this.signer);
      return (await axios.post(`${this.host}/bip-round/create`, signedPayload)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }





  async approveAuction(ApproveData: ApproveRound): Promise<StoredTimedAuction[]> {
    if (!this.signer) throw 'Please sign';
    try {
      const signedPayload = await ApproveData.signedPayload(this.signer);
      return (await axios.post(`${this.host}/auctions/approve`, signedPayload)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async createDelegateAuction(auction: TimedDelegate): Promise<any[]> {
    if (!this.signer) throw 'Please sign';
    try {
      const signedPayload = await auction.signedPayload(this.signer);

      return (await axios.post(`${this.host}/delegations/create`, signedPayload)).data;
    } catch (e: any) {
      throw e.response.data;
    }
  }

  async getAuction(id: number): Promise<StoredTimedAuction> {
    try {
      let rawTimedAuction: any;
      if (this.signer){
        const owner = (await this.signer.getAddresses())[0];
        rawTimedAuction = (await axios.get(`${this.host}/auctions/${id}?address=${owner}`)).data;
      } else {
        rawTimedAuction = (await axios.get(`${this.host}/auctions/${id}`)).data;
      }
      return StoredTimedAuction.FromResponse(rawTimedAuction);
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getDelegatesVotes(id: number): Promise<any> {
    try {
      const raw = (await axios.get(`${this.host}/delegates/list?applicationId=${id}`)).data;
      return raw;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getDelegationApplied(id: number,account: string ): Promise<any> {
    // if (!this.signer) return;

    try {
      // const owner = (await this.signer.getAddresses())[0];
      const raw = (await axios.get(`${this.host}/applications/canCreate?delegationId=${id}&address=${account}`)).data;
      return raw;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getProposalApplied(id: number,account:string ): Promise<any> {
    try {
      const raw = (await axios.get(`${this.host}/proposals/canCreate?auctionId=${id}&address=${account}`)).data;
      return raw;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getDelegateStatus(id: any): Promise<any> {
    if (!this.signer) throw 'Please sign';
    try {
      const owner = (await this.signer.getAddresses())[0];
      const raw = (await axios.get(`${this.host}/delegates/canVote?address=${owner}&applicationId=${id}`)).data;
      return raw;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getDelegate(id: number): Promise<any> {
    try {
      const rawTimedAuction = (await axios.get(`${this.host}/delegates/${id}`)).data;
      return StoredTimedAuction.FromResponse(rawTimedAuction);
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getAuctions(): Promise<StoredTimedAuction[]> {
    try {
      const rawAuctions = (await axios.get(`${this.host}/auctions`)).data;
      return rawAuctions.map(StoredTimedAuction.FromResponse);
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getDefaultCreation(): Promise<any> {
    try {
      return (await axios.get(`${this.host}/langs/defaultsForCreation`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getAuctionsForCommunity(id: number): Promise<StoredAuctionBase[]> {
    try {
      const [rawTimedAuctions,
        // , rawInfAuctions
      ] = await Promise.allSettled([
        axios.get(`${this.host}/auctions/forCommunity/${id}`),
        // ,axios.get(`${this.host}/infinite-auctions/forCommunity/${id}`),
      ]);

      const timed =
        rawTimedAuctions.status === 'fulfilled'
          ? rawTimedAuctions.value.data.map(StoredTimedAuction.FromResponse)
          : [];

      // const infinite =
      //   rawInfAuctions.status === 'fulfilled'
      //     ? rawInfAuctions.value.data.map(StoredInfiniteAuction.FromResponse)
      //     : [];

      // return timed.concat(infinite);
      return timed;
    } catch (e: any) {
      throw e.response?.data?.message ?? 'Error occurred while fetching auctions for community';
    }
  }

  async getDelegateForCommunity(): Promise<StoredAuctionBase[]> {
    try {
      const [rawTimedAuctions] = await Promise.allSettled([
        axios.get(`${this.host}/delegations/list/`),
      ]);

      const timed =
        rawTimedAuctions.status === 'fulfilled'
          ? rawTimedAuctions.value.data.map(StoredTimedAuction.FromResponse)
          : [];

      return timed;
    } catch (e: any) {
      throw e.response?.data?.message ?? 'Error occurred while fetching auctions for community';
    }
  }

  async getBipForCommunity(): Promise<StoredAuctionBase[]> {
    try {
      const [rawTimedAuctions] = await Promise.allSettled([
        axios.get(`${this.host}/bip-round/list?order=Desc`),
      ]);

      const timed =
          rawTimedAuctions.status === 'fulfilled'
              ? rawTimedAuctions.value.data.map(StoredTimedAuction.FromResponse)
              : [];

      return timed;
    } catch (e: any) {
      throw e.response?.data?.message ?? 'Error occurred while fetching auctions for community';
    }
  }



  async getActiveAuctions(skip = 5, limit = 5): Promise<StoredTimedAuction[]> {
    try {
      const rawAuctions = (
        await axios.get(`${this.host}/auctions/allActive/n`, {
          params: {
            limit,
            skip,
          },
        })
      ).data;
      return rawAuctions.map(StoredTimedAuction.FromResponse);
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getActiveAuctionsForCommunities(
    skip = 5,
    limit = 5,
    addresses: string[],
  ): Promise<StoredTimedAuction[]> {
    try {
      const rawAuctions = (
        await axios.get(`${this.host}/auctions/active/f`, {
          params: {
            limit,
            skip,
            addresses,
          },
        })
      ).data;
      return rawAuctions.map(StoredTimedAuction.FromResponse);
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  /**
   * total vote weight submitted to round id after given timestamp
   * @param auctionId
   * @param timestamp unix timestamp (ms)
   */
  async getLatestNumVotes(auctionId: number, timestamp: number): Promise<number> {
    try {
      return (
        await axios.get(`${this.host}/auctions/latestNumVotes/f`, {
          params: {
            auctionId,
            timestamp,
          },
        })
      ).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  /**
   * number of proposals submitted to round id after given timestamp
   * @param auctionId
   * @param timestamp unix timestamp (ms)
   */
  async getLatestNumProps(auctionId: number, timestamp: number): Promise<number> {
    try {
      return (
        await axios.get(`${this.host}/auctions/latestNumProps/f`, {
          params: {
            auctionId,
            timestamp,
          },
        })
      ).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getAuctionWithNameForCommunity(
    auctionName: string,
    communityId: number,
  ): Promise<StoredAuctionBase> {
    try {
      const rawTimedAuction = (
        await axios.get(`${this.host}/auctions/${auctionName}/community/${communityId}`)
      ).data;
      return StoredTimedAuction.FromResponse(rawTimedAuction);
    } catch (e : any) {
      throw e.response.data.message;
    }
  }

  async getAuctionWithIDForCommunity(
    auctionID: number,
  ): Promise<StoredAuctionBase> {
    try {
      const rawTimedAuction = (
        await axios.get(`${this.host}/auctions/pk/${auctionID}`)
      ).data;
      return StoredTimedAuction.FromResponse(rawTimedAuction);
    } catch (e: any) {
      // try {
      //   const rawInfAuction = (
      //       await axios.get(`${this.host}/infinite-auctions/${auctionName}/community/${communityId}`)
      //   ).data;
      //   return StoredInfiniteAuction.FromResponse(rawInfAuction);
      // } catch (e: any) {
      throw e.response.data.message;
      // }
    }
  }

  async getUserType( address: string) {
    try {
      return (await axios.post(`${this.host}/admins/getUserType?address=${address}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getDelegateDetails(
    id: number,
  ): Promise<StoredAuctionBase> {
    try {
      const rawTimedAuction = (
        await axios.get(`${this.host}/delegations/${id}`)
      ).data;
      return StoredTimedAuction.FromResponse(rawTimedAuction);
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getProposals(limit = 20, skip = 0, order: 'ASC' | 'DESC' = 'DESC') {
    try {
      const { data } = await axios.get(`${this.host}/proposals`, {
        params: {
          limit,
          skip,
          order,
        },
      });
      return data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getProposal(id: number, address?: string) {
    try {
      return (await axios.get(`${this.host}/proposals/${id}`, {
        params: {
          address,
        },
      })).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getBIP(id: number, address?: string) {
    try {
      return (await axios.get(`${this.host}/bip-round/detail/${id}`, {
        params: {
          address,
        },
      })).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }


  async getApplication(id: number) {
    try {
      return (await axios.get(`${this.host}/applications/${id}/detail`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }


  async getAuctionProposals(auctionId: number) {
    try {
      return (await axios.get(`${this.host}/auctions/${auctionId}/proposals`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getNominessByDelegate(auctionId: number) {
    try {
      return (await axios.get(`${this.host}/applications/byDelegation/${auctionId}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async createProposal(proposal: Proposal) {
    if (!this.signer) {
      console.log('no signer')
      return;
    }
    try {
      const signedPayload = await proposal.signedPayload(this.signer);
      return (await axios.post(`${this.host}/proposals`, signedPayload)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async createApplication(proposal: Proposal) {
    if (!this.signer) return;
    try {

      const application = new Application(
          proposal.title,
          proposal.what,
          proposal.tldr,
          proposal.auctionId,
          proposal.parentType,
          proposal.previewImage,
      )

      const signedPayload = await application.signedPayload(this.signer);

      // signedPayload.description = signedPayload.what;
      // signedPayload.delegationId = signedPayload.parentAuctionId;

      return (await axios.post(`${this.host}/applications/create`, signedPayload)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async updateProposal(updatedProposal: UpdatedProposal, isContract = false) {
    if (!this.signer) return;
    try {
      const signedPayload = await updatedProposal.signedPayload(this.signer);
      return (await axios.patch(`${this.host}/proposals`, signedPayload)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async deleteProposal(deleteProposal: DeleteProposal, isContract = false) {
    if (!this.signer) return;
    try {
      const signedPayload = await deleteProposal.signedPayload(this.signer);
      return (await axios.delete(`${this.host}/proposals`, { data: signedPayload })).data;
    } catch (e: any) {
      console.log('deleteProposal',e);
      throw e;
    }
  }

  async deleteDelegate(deleteApplication: DeleteApplication) {
    if (!this.signer) return;
    try {
      const signedPayload = await deleteApplication.signedPayload(   this.signer  );
      return (await axios.delete(`${this.host}/delegates`, { data: signedPayload })).data;
    } catch (e: any) {
      console.log('deleteDelegate',e);
      throw e;
    }
  }

  async getVotes(
    limit = 20,
    skip = 0,
    order: 'ASC' | 'DESC' = 'DESC',
    addresses?: string[],
  ): Promise<StoredVoteWithProposal[]> {
    try {
      const { data } = await axios.get(`${this.host}/votes/findWithOpts`, {
        params: {
          limit,
          skip,
          order,
          addresses,
        },
      });
      return data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getNumVotesCastedForRound(account: string, roundId: number) {
    try {
      return (await axios.get(`${this.host}/votes/numVotes/${account}/${roundId}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async createVote(vote: Vote) {
    if (!this.signer) return;
    try {
      const signedPayload = await vote.signedPayload(this.signer);
      return (await axios.post(`${this.host}/votes`, signedPayload)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async createBIPVote(vote: BIPVote) {
    if (!this.signer) return;
    try {
      const signedPayload = await vote.signedPayload(this.signer);
      return (await axios.post(`${this.host}/bip-votes/create`, signedPayload)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }


  async deleteBIPVote(deleteVote: DeleteBIPVote) {
    if (!this.signer)
      return;
    try {
      const signedPayload = await deleteVote.signedPayload(this.signer);
      return (await axios.post(`${this.host}/bip-votes/remove`, signedPayload)).data;
    }
    catch (e: any) {
      throw e.response.data.message;
    }
  }

  async deleteVote(deleteVote: DeleteVote) {
    if (!this.signer) return;
    try {
      const signedPayload = await deleteVote.signedPayload(this.signer);
      return (await axios.delete(`${this.host}/votes`, { data: signedPayload })).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async createDelegate(applicationId: any) {
    if (!this.signer) return;
    try {
      let payload = {
        'applicationId': applicationId,
      };
      const signMessage = JSON.stringify(payload);
      const owner = (await this.signer.getAddresses())[0];
      const signature = await this.signer.signMessage({
        account: owner,
        message: signMessage,
      });
      const signedPayload = {
        signedData: {
          message: Buffer.from(signMessage).toString('base64'),
          signature,
          signer: owner,
        },
        address: owner,
        applicationId: applicationId,
      };

      return (await axios.post(`${this.host}/delegates/create`, signedPayload)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getAddressFiles(address: string): Promise<StoredFile[]> {
    try {
      return (await axios.get(`${this.host}/file/${address}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async postFile(file: File, name: string) {
    try {
      const form = new FormData();
      form.append('file', file, name);
      form.append('name', name);
      const config = {
        headers: {
          'content-type': 'multipart/form-data',
        },
      };
      return await axios.post(`${this.host}/file`, form, config);
    } catch (e: any) {
      console.log('error', e);
      throw e.response.data.message;
    }
  }

  /**
   * POST a buffer for storage.
   * @param fileBuffer The buffer to store
   * @param name The filename to upload the buffer as
   * @param signBuffer Whether a signer (if provided during instantiation)
   * should be used to sign the payload.
   */
  async postFileBuffer(fileBuffer: Buffer, name: string, signBuffer: boolean = false) {
    try {
      const form = new FormData();
      form.append('file', fileBuffer, name);
      form.append('name', name);
      if (this.signer && signBuffer) {

        const address = (await this.signer.getAddresses())[0];

        const signature = await this.signer.signMessage({
          account: address,
          message: fileBuffer.toString(),
        });
        form.append('signature', signature);
      }
      return await axios.post(`${this.host}/file`, form, {
        headers: {
          ...form.getHeaders(),
        },
      });
    } catch (e: any) {
      throw e.response;
    }
  }

  /**
   * POST a file for storage from on disk data.
   * @param path Path to the file on disk
   * @param name The filename to upload as
   * @param signBuffer Whether a signer (if provided during instantiation)
   * should be used to sign the payload.
   */
  async postFileFromDisk(path: string, name: string, signBuffer: boolean = false) {
    return this.postFileBuffer(fs.readFileSync(path), name, signBuffer);
  }

  async getAddress() {
    if (!this.signer) return undefined;
    return (await this.signer.getAddresses())[0];
  }

  async getVotesByAddress(address: string): Promise<StoredVote[]> {
    try {
    } catch (e: any) {
      throw e.response.data.message;
    }
    return (await axios.get(`${this.host}/votes/by/${address}`)).data;
  }

  async getVotesForCommunities(addresses: string[]): Promise<StoredVoteWithProposal[]> {
    try {
      return (await axios.get(`${this.host}/votes/byCommunities/${addresses}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getCommunities(): Promise<CommunityWithAuctions[]> {
    try {
      return (await axios.get(`${this.host}/communities`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getCommunity(contractAddress: string): Promise<CommunityWithAuctions> {
    try {
      return (await axios.get(`${this.host}/${contractAddress}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getCommunityWithId(id: number): Promise<Community> {
    try {
      return (await axios.get(`${this.host}/communities/id/${id}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getCommunityWithName(name: string): Promise<CommunityWithAuctions> {
    try {
      return (await axios.get(`${this.host}/communities/name/${name}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getCommentListByProposal(proposalId: number, skip: number, limit = 10, order = 'DESC'): Promise<StoredComment[]> {
    try {
      return (await axios.get(`${this.host}/comments/byProposal/${proposalId}`, {
        params: {
          'skip': skip,
          'limit': limit,
          'order': order,
        },
      })).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getCommentListByBIP(bipId: number, skip: number, limit = 10, order = 'DESC'): Promise<StoredComment[]> {
    try {
      return (await axios.get(`${this.host}/bip-comments/byBipRound/${bipId}`, {
        params: {
          'skip': skip,
          'limit': limit,
          'order': order,
        },
      })).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getCommentListByApplication(applicationId: number, skip: number, limit = 10, order = 'DESC'): Promise<StoredComment[]> {
    try {
      return (await axios.get(`${this.host}/comments/byApplication/${applicationId}`, {
        params: {
          'skip': skip,
          'limit': limit,
          'order': order,
        },
      })).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async createComment(comment: Comment): Promise<StoredComment | undefined> {
    if (!this.signer) return undefined;
    if (!comment.proposalId && !comment.applicationId && !comment.bipRoundId) return undefined;
    try {

      const signedPayload = await comment.signedPayload(this.signer);

      if ( comment.bipRoundId ){
        return (await axios.post(`${this.host}/bip-comments/create`, signedPayload)).data;
      }else{
        return (await axios.post(`${this.host}/comments/create`, signedPayload)).data;
      }

    } catch (e: any) {
      console.log(e);
      throw e.response.data.message;
    }
  }
}
