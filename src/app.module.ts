import { Application } from "express";
import { agent_module, auth_module, notification_module, prompt_module, subscription_module, template_module, user_module, webhook_module } from "./gen-import";

export default (app: Application) => {
     app.use('/api/v1/auth', auth_module)
     app.use('/api/v1/users', user_module)
     app.use('/api/v1/agent', agent_module)
     app.use('/api/v1/notifications', notification_module)
     app.use('/api/v1/prompts', prompt_module)
     app.use('/api/v1/templates', template_module)
     app.use('/api/v1/subscriptions', subscription_module)
     app.use('/api/webhooks', webhook_module)
}
