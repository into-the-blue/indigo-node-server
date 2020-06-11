export class SubscriptionInvalidValue extends Error {
  constructor() {
    super('Invalid Value');
  }
}

export class SubscriptionExceedQuota extends Error {
  constructor() {
    super('Exceed quota');
  }
}
