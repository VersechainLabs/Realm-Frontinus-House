import { Direction, StoredVote } from '@nouns/frontinus-house-wrapper/dist/builders';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: any = {
  click: false,
  type: 'error',
  message: 'error',
};

//type error warning info success

export const alertSlice = createSlice({
  name: 'voting',
  initialState,
  reducers: {
    setAlert: (state, action ) => {
      console.log('set alert')

      state.type = action.payload.type ?? 'error' ;
      state.message = action.payload.message ?? 'error';
      state.click = true;
    },
    clearClick: (state ) => {
      state.click = false;
    },


  },
});

// Action creators are generated for each case reducer function
export const {
  setAlert,
  clearClick,
} = alertSlice.actions;

export default alertSlice.reducer;
