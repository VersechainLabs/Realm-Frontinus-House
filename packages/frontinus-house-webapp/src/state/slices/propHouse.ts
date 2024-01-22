import {
  StoredProposalWithVotes,
  Community,
  StoredAuctionBase,
  InfiniteAuction,
} from '@nouns/frontinus-house-wrapper/dist/builders';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { sortByVotesAndHandleTies } from '../../utils/sortByVotesAndHandleTies';

export interface PropHouseSlice {
  activeBIP?:StoredProposalWithVotes;
  activeRound?: StoredAuctionBase;
  activeProposal?: StoredProposalWithVotes;
  activeProposals?: StoredProposalWithVotes[];
  activeCommunity?: Community;
  modalActive: boolean;
  houseTab:number;
  infRoundFilteredProposals?: StoredProposalWithVotes[];
  infRoundFilterType: InfRoundFilterType;
}

interface TimedRoundSortProps {
  sortType: TimedRoundSortType;
  ascending: boolean;
}

export enum TimedRoundSortType {
  VoteCount,
  CreatedAt,
  Random,
}

export enum InfRoundFilterType {
  Active,
  Winners,
  Stale,
}

const initialState: PropHouseSlice = {
  modalActive: false,
  houseTab:0,
  infRoundFilterType: InfRoundFilterType.Active,
};

const sortHelper = (a: any, b: any, ascending: boolean) => {
  return ascending ? (a < b ? -1 : 1) : a < b ? 1 : -1;
};

const sortTimedRoundProps = (proposals: StoredProposalWithVotes[], props: TimedRoundSortProps) => {
  switch (props.sortType) {
    case TimedRoundSortType.VoteCount:
      return sortByVotesAndHandleTies(proposals, props.ascending);
    case TimedRoundSortType.Random:
      return proposals.sort(() => Math.random() - 0.5);
    case TimedRoundSortType.CreatedAt:
      return proposals.sort((a, b) =>
        sortHelper(dayjs(a.createdDate), dayjs(b.createdDate), props.ascending),
      );
    default:
      return proposals.sort((a, b) =>
        sortHelper(dayjs(a.createdDate), dayjs(b.createdDate), props.ascending),
      );
  }
};

const filterInfRoundProps = (
  props: StoredProposalWithVotes[],
  type: InfRoundFilterType,
  round: InfiniteAuction,
) => {
  const now = dayjs();
  switch (type) {
    case InfRoundFilterType.Active:
      return props
        .filter(
          p =>
            p.voteCount < round.quorum &&
            dayjs(p.createdDate).isAfter(now.subtract(round.votingPeriod, 's')),
        )
        .sort((a, b) => sortHelper(a.voteCount, b.voteCount, false));
    case InfRoundFilterType.Winners:
      return props
        .filter(p => p.voteCount >= round.quorum)
        .sort((a, b) => sortHelper(a.createdDate, b.createdDate, false));
    case InfRoundFilterType.Stale:
      return props
        .filter(
          p =>
            p.voteCount < round.quorum &&
            dayjs(p.createdDate).isBefore(now.subtract(round.votingPeriod, 's')),
        )
        .sort((a, b) => sortHelper(a.createdDate, b.createdDate, false));
    default:
      return props;
  }
};

export const propHouseSlice = createSlice({
  name: 'propHouse',
  initialState,
  reducers: {
    setActiveBIP:(state, action: PayloadAction<StoredAuctionBase | undefined>) => {
      state.activeBIP = action.payload;
    },
    setActiveRound: (state, action: PayloadAction<StoredAuctionBase | undefined>) => {
      state.activeRound = action.payload;
    },
    setActiveProposal: (state, action: PayloadAction<StoredProposalWithVotes>) => {
      state.activeProposal = action.payload;
    },
    setActiveProposals: (state, action: PayloadAction<StoredProposalWithVotes[]>) => {
      state.activeProposals = sortTimedRoundProps(action.payload, {
        sortType: TimedRoundSortType.CreatedAt,
        ascending: false,
      });
      state.infRoundFilteredProposals = action.payload;
    },
    appendProposal: (state, action: PayloadAction<{ proposal: StoredProposalWithVotes }>) => {
      state.activeProposals?.push(action.payload.proposal);
    },
    sortTimedRoundProposals: (state, action: PayloadAction<TimedRoundSortProps>) => {
      if (!state.activeProposals) return;
      state.activeProposals = sortTimedRoundProps(state.activeProposals, action.payload);
    },
    filterInfRoundProposals: (
      state,
      action: PayloadAction<{ type: InfRoundFilterType; round: InfiniteAuction }>,
    ) => {
      if (!state.activeProposals) return;

      state.infRoundFilteredProposals = filterInfRoundProps(
        state.activeProposals,
        action.payload.type,
        action.payload.round,
      );
    },
    setInfRoundFilterType: (state, action: PayloadAction<InfRoundFilterType>) => {
      state.infRoundFilterType = action.payload;
    },
    setActiveCommunity: (state, action: PayloadAction<Community | undefined>) => {
      state.activeCommunity = action.payload;
    },
    setModalActive: (state, action: PayloadAction<boolean>) => {
      state.modalActive = action.payload;
    },
    setHouseTab: (state, action: PayloadAction<number>) => {
      state.houseTab = action.payload;
      },

  },
});

// Action creators are generated for each case reducer function
export const {
  setActiveRound,
  setActiveProposal,
  setActiveBIP,
  setActiveProposals,
  appendProposal,
  sortTimedRoundProposals,
  filterInfRoundProposals,
  setActiveCommunity,
  setModalActive,
  setHouseTab,
  setInfRoundFilterType,
} = propHouseSlice.actions;

export default propHouseSlice.reducer;
