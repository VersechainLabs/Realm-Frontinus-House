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