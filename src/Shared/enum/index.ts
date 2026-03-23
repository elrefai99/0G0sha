
export enum USER_PLAN {
     FREE = 'free',
     STARTER = 'starter',
     PRO = 'pro',
     ENTERPRISE = 'enterprise',
}

export enum TOKEN_LEDGER_ACTION {
     OPTIMIZE = 'optimize',
     RESET = 'reset',
     BONUS = 'bonus',
     EXPIRE = 'expire',
}

export enum PLAN_PROVIDER {
     STRIPE = 'stripe',
     PAYMOB = 'paymob',
}

export enum PAYMENT_STATUS {
     SUCCEEDED = 'succeeded',
     PENDING = 'pending',
     FAILED = 'failed',
     REFUNDED = 'refunded',
}

export enum PAYMENT_METHOD {
     CARD = 'card',
     WALLET = 'wallet',
}
