export class ExistingABetterMembership extends Error {
  constructor() {
    super('Existing a better membership');
  }
}

export class ExceedFreeMembershipQuota extends Error {
  constructor() {
    super('Exceed free membership quota');
  }
}
