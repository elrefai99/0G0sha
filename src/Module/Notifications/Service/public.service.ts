import { Response } from 'express';
import { createClient } from 'redis';
import { formatSSEEvent, formatHeartbeat } from '../Utils/sseFormat';
import { SSEClient, NotificationPayload } from '../@types';

const publisher = createClient({ url: process.env.REDIS_CACHE_LIVE });
publisher.connect();

// Call this from any BullMQ worker or service
export const publishNotification = async (
     userId: string,
     payload: NotificationPayload
): Promise<void> => {
     await publisher.publish(`notifications:${userId}`, JSON.stringify(payload));
};
