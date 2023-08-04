import { Direction, StoredVote } from '@nouns/frontinus-house-wrapper/dist/builders';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: any = {
  address: '',
  type: '',
};

//type error warning info success

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserType: (state, action ) => {

      state.type = action.payload.type ?? 'user' ;
      state.address = action.payload.address ?? '' ;

    },

  },
});

// Action creators are generated for each case reducer function
export const {
  setUserType
} = userSlice.actions;

export default userSlice.reducer;
