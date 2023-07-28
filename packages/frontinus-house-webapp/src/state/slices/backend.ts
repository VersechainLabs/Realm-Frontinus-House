import { Signer } from '@ethersproject/abstract-signer'
import { Wallet } from '@ethersproject/wallet'
import { ApiWrapper } from '@nouns/frontinus-house-wrapper'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface BackendSlice {
	backend: ApiWrapper;
}


const exampleWallet = Wallet.fromMnemonic(
  "test test test test test test test test test test test junk"
);
const adminPath = "m/44'/60'/0'/0/1";
const adminWallet = Wallet.fromMnemonic(
  "test test test test test test test test test test test junk",
  adminPath
);
console.log(`The example wallet is using address ${exampleWallet.address}`);
console.log(`The admin wallet is using address ${adminWallet.address}`);

const local = new ApiWrapper("http://localhost:3000", exampleWallet);

const initialState: BackendSlice = {
	backend: local,
}

export const backendSlice = createSlice({
  name: 'backend',
  initialState,
  reducers: {
		reconnect: (state, action: PayloadAction<Signer | Wallet>) => {
			state.backend = new ApiWrapper("http://localhost:3000", action.payload)
		}
  }
})

// Action creators are generated for each case reducer function
export const { reconnect } = backendSlice.actions

export default backendSlice.reducer