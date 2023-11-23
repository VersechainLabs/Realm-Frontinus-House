import { snapshotMultiple } from '../strategies';
import { CaseInsensitiveMap } from '../types/CaseInsensitiveMap';
import { StrategyType } from '../strategies/snapshotMultiple';
import { mockRandomByBlock } from '../strategies/mockRandomByBlock';
import { Strategy } from '../types/Strategy';

/**
 * Contract addresses for communities that require custom voting strategy.
 */
export const communities = new CaseInsensitiveMap(
  Object.entries<Strategy>({
    // These strategies from : https://snapshot.org/#/council.bibliotheca.eth/proposal/0x755fc15017bc4a061e385c3fe4cd65b9e39496ba028577b4828c3a3f8dc4b71f
    '0x7AFe30cB3E53dba6801aa0EA647A0EcEA7cBe18d': snapshotMultiple([
      {
        address: '0x17963290db8c30552d0cfa2a6453ff20a28c31a2',
        strategyType: StrategyType.ContractCall,
        multiplier: 1,
      },
      {
        address: '0xcdfe3d7ebfa793675426f150e928cd395469ca53',
        strategyType: StrategyType.ContractCall,
        multiplier: 1,
      },
      {
        address: '0x7AFe30cB3E53dba6801aa0EA647A0EcEA7cBe18d',
        strategyType: StrategyType.Erc721,
        multiplier: 1,
      },
    ]),

    // Mock strategies.
    '0x82cE4e52918B83cCf7072594db05Eb186443A62F': mockRandomByBlock(),

    // Test strategies on test chain
    '0x86f7692569914b5060ef39aab99e62ec96a6ed45': snapshotMultiple([
      {
        address: '0x86f7692569914b5060ef39aab99e62ec96a6ed45',
        strategyType: StrategyType.Erc721,
        multiplier: 1,
      },
    ]),

    // Chao-minted test NFT on test chain
    '0xBd0d064094780CbCb5B33dA22B2BbA9A39fBD90E': snapshotMultiple([
      {
        address: '0xBd0d064094780CbCb5B33dA22B2BbA9A39fBD90E',
        strategyType: StrategyType.Erc721,
        multiplier: 1,
      },
    ]),
  }),
);
