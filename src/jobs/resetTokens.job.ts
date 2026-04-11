import cron from 'node-cron'
import { resetAllTokens } from '../Module/subscription/Service/token.service.js'
import { createLogger } from '@/gen-import'

const logger = createLogger('TokenResetJob')

export const startTokenResetJob = (): void => {
     cron.schedule('0 0 * * *', async () => {
          try {
               const count = await resetAllTokens()
               logger.info({ usersReset: count }, 'Daily token reset complete')
          } catch (err) {
               logger.error({ err }, 'Daily token reset failed')
          }
     }, { timezone: 'UTC' })

     logger.info('Token reset cron scheduled: daily 00:00 UTC')
}
