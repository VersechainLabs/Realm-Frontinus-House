import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  title: '',
  tldr: '',
  description: '',
  id: 0,
};

const proposalSlice = createSlice({
  name: 'proposal',
  initialState,
  reducers: {
    setProposalData: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { setProposalData } = proposalSlice.actions;


export default proposalSlice.reducer;