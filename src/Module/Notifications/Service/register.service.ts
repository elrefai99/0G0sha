import { NotificationPayload, SSEClient } from "../@types";
import { formatSSEEvent } from "../Utils/sseFormat";

export const registerClient = async (
     userId: string,
     res: Response,
     lastEventId?: string
): Promise<void> => {
     const subscriber = createClient({ url: process.env.REDIS_CACHE_LIVE });
     await subscriber.connect();

     const client: SSEClient = { userId, res, lastEventId };
     clients.set(userId, client);

     // Subscribe to user-specific channel
     await subscriber.subscribe(`notifications:${userId}`, (message: any) => {
          try {
               const payload: NotificationPayload = JSON.parse(message);
               return formatSSEEvent(payload);
          } catch {
               // malformed message — skip
          }
     });

     // Heartbeat every 25s to prevent proxy/LB timeouts
     const heartbeat = setInterval(() => {
          res.write(formatHeartbeat());
     }, 25_000);

     // Cleanup on disconnect
     res.on('close', async () => {
          clearInterval(heartbeat);
          clients.delete(userId);
          await subscriber.unsubscribe(`notifications:${userId}`);
          await subscriber.disconnect();
     });
};
