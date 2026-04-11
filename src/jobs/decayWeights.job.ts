import cron from 'node-cron'
import { LearnedWeightModel, createLogger } from '@/gen-import'

const logger = createLogger('WeightDecayJob')

const DECAY_FACTOR = 0.95
const WEIGHT_FLOOR = 0.2

export const startWeightDecayJob = (): void => {
     cron.schedule('0 3 * * 0', async () => {
          try {
               const weights = await LearnedWeightModel.find({})
               let updated = 0

               for (const w of weights) {
                    const newWeight = Math.max(w.weight * DECAY_FACTOR, WEIGHT_FLOOR)
                    if (newWeight !== w.weight) {
                         w.weight = newWeight
                         await w.save()
                         updated++
                    }
               }

               logger.info({ weightsDecayed: updated }, 'Weekly weight decay complete')
          } catch (err) {
               logger.error({ err }, 'Weekly weight decay failed')
          }
     }, { timezone: 'UTC' })

     logger.info('Weight decay cron scheduled: weekly Sunday 03:00 UTC')
}
