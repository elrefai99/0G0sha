import { UserModel, TokenLedgerModel, AppError, createLogger } from '@/gen-import'

const logger = createLogger('TokenService')

const isNewDay = (lastReset: Date): boolean => {
     const now = new Date()
     return (
          lastReset.getUTCFullYear() !== now.getUTCFullYear() ||
          lastReset.getUTCMonth() !== now.getUTCMonth() ||
          lastReset.getUTCDate() !== now.getUTCDate()
     )
}

const getResetTime = (): Date => {
     const tomorrow = new Date()
     tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
     tomorrow.setUTCHours(0, 0, 0, 0)
     return tomorrow
}

export const checkBudget = async (
     userId: string,
     estimatedCost: number,
): Promise<{
     allowed: boolean
     used: number
     limit: number
     remaining: number
     resetsAt: Date
}> => {
     const user = await UserModel.findById(userId, { tokens: 1 })
     if (!user) throw AppError.notFound('User not found')

     if (isNewDay(user.tokens.lastResetAt)) {
          user.tokens.used = 0
          user.tokens.lastResetAt = new Date()
          await user.save()

          await TokenLedgerModel.create({
               userId,
               amount: 0,
               action: 'reset',
               promptId: null,
               balanceAfter: user.tokens.limit,
          })

          logger.debug({ userId }, 'Lazy token reset triggered')
     }

     const remaining = user.tokens.limit - user.tokens.used
     const allowed = estimatedCost <= remaining

     return {
          allowed,
          used: user.tokens.used,
          limit: user.tokens.limit,
          remaining,
          resetsAt: getResetTime(),
     }
}

export const consume = async (
     userId: string,
     amount: number,
     promptId: string,
): Promise<{
     tokensUsed: number
     tokensRemaining: number
     dailyLimit: number
     resetsAt: Date
}> => {
     const user = await UserModel.findByIdAndUpdate(
          userId,
          { $inc: { 'tokens.used': amount } },
          { new: true, projection: { tokens: 1 } },
     )

     if (!user) throw AppError.notFound('User not found')

     const remaining = user.tokens.limit - user.tokens.used

     await TokenLedgerModel.create({
          userId,
          amount,
          action: 'optimize',
          promptId,
          balanceAfter: remaining,
     })

     logger.debug({ userId, amount, remaining }, 'Tokens consumed')

     return {
          tokensUsed: amount,
          tokensRemaining: remaining,
          dailyLimit: user.tokens.limit,
          resetsAt: getResetTime(),
     }
}

export const getUsage = async (userId: string) => {
     const user = await UserModel.findById(userId, {
          tokens: 1,
          plan: 1,
          subscription: 1,
     }).lean().exec()

     if (!user) throw AppError.notFound('User not found')

     logger.debug({ userId }, 'Fetching token usage')

     return {
          plan: user.plan,
          tokens: {
               used: user.tokens.used,
               limit: user.tokens.limit,
               remaining: Math.max(0, user.tokens.limit - user.tokens.used),
               resetsAt: getResetTime(),
          },
          billing: user.subscription
               ? { subscriptionId: user.subscription }
               : null,
     }
}

export const resetAllTokens = async (): Promise<number> => {
     const result = await UserModel.updateMany(
          {},
          { $set: { 'tokens.used': 0, 'tokens.lastResetAt': new Date() } },
     )
     return result.modifiedCount
}
