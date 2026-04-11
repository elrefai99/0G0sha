/**
 * @openapi
 * tags:
 *   name: Notifications
 *   description: Real-time notifications via SSE and notification history
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     PublishNotificationBody:
 *       type: object
 *       required: [type, title, message]
 *       properties:
 *         type:
 *           type: string
 *           enum: [upload, comment, like, system]
 *           example: system
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           example: "Welcome to Gosha"
 *         message:
 *           type: string
 *           minLength: 1
 *           maxLength: 1000
 *           example: "Your account has been set up successfully"
 *
 *     NotificationItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64a2f3c8e4b0d12345678901
 *         userId:
 *           type: string
 *           example: 64a2f3c8e4b0d12345678901
 *         type:
 *           type: string
 *           enum: [upload, comment, like, system]
 *           example: system
 *         title:
 *           type: string
 *           example: "Welcome to Gosha"
 *         message:
 *           type: string
 *           example: "Your account has been set up successfully"
 *         seen:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/v1/notifications/stream:
 *   get:
 *     tags: [Notifications]
 *     summary: Subscribe to real-time notifications via SSE
 *     description: |
 *       Opens a Server-Sent Events connection. The server pushes notifications
 *       in real-time via Redis pub/sub. Keep-alive heartbeats are sent every 30s.
 *       Close the connection from the client to unsubscribe.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: SSE stream opened
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: |
 *                 event: notification
 *                 data: {"type":"system","title":"Welcome","message":"Hello!"}
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/notifications/publish:
 *   post:
 *     tags: [Notifications]
 *     summary: Publish a notification to the authenticated user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PublishNotificationBody'
 *     responses:
 *       200:
 *         description: Notification published
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification published
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification history
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: seen
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter by seen status
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotificationItem'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/notifications/{id}/seen:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a single notification as seen
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification document ID
 *         example: 64a2f3c8e4b0d12345678901
 *     responses:
 *       200:
 *         description: Notification marked as seen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification marked as seen
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/notifications/seen-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as seen
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as seen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: All notifications marked as seen
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
