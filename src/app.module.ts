import { Application } from 'express'
import authModule from './Module/Authentication/auth.module'
import userModule from './Module/User/user.module'
import agentModule from './Module/agent/agent.module'
import notificationModule from './Module/Notifications/notification.module'
import promptModule from './Module/prompt/prompt.module'
import templateModule from './Module/template/template.module'
import subscriptionModule from './Module/subscription/subscription.module'
import webhookModule from './Module/subscription/webhook.module'

export default (app: Application) => {
     app.use('/api/v1/auth', authModule)
     app.use('/api/v1/users', userModule)
     app.use('/api/v1/agent', agentModule)
     app.use('/api/v1/notifications', notificationModule)
     app.use('/api/v1/prompts', promptModule)
     app.use('/api/v1/templates', templateModule)
     app.use('/api/v1/subscriptions', subscriptionModule)
     app.use('/api/webhooks', webhookModule)
}
