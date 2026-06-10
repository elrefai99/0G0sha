import { AppError } from '../../../Shared/errors/app-error'
import { createLogger } from '../../../utils/logger'
import { PlanModel } from '../Schema/plans.schema'

const logger = createLogger('SubscriptionService')

const PLAN_PROJECTION = {
     name: 1,
     displayName: 1,
     price: 1,
     tokensPerDay: 1,
     features: 1,
     limits: 1,
} as const

export const listPlans = async (): Promise<unknown[]> => {
     logger.debug('Listing active plans')

     return PlanModel.find({ isActive: true }, PLAN_PROJECTION)
          .sort({ tokensPerDay: 1 })
          .lean()
          .exec()
}

export const upgrade = async (
     _userId: string,
     _planId: string,
     _billing: string,
     _provider: string,
     _method?: string,
): Promise<never> => {
     throw AppError.badRequest('All subscriptions are free. No paid upgrades are available.')
}

export const cancel = async (
     _userId: string,
): Promise<never> => {
     throw AppError.badRequest('All subscriptions are free. There is nothing to cancel.')
}
