export enum AuctionVisibleStatus {
  PENDING = 0,
  NORMAL = 1,
  // The backend will not use this status temporarily, and setting it to this status will delete it directly.
  REJECT = 2,
}