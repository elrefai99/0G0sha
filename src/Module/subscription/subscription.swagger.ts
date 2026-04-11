/**
 * @openapi
 * tags:
 *   name: Subscriptions
 *   description: Plans, billing, token usage, and payment webhooks
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     PlanSummary:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64a2f3c8e4b0d12345678901
 *         name:
 *           type: string
 *           example: starter
 *         displayName:
 *           type: string
 *           example: Starter
 *         price:
 *           type: number
 *           example: 9
 *         tokensPerDay:
 *           type: integer
 *           example: 50
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["50 tokens/day", "All models", "Email support"]
 *         limits:
 *           type: object
 *           properties:
 *             maxPromptsPerDay:
 *               type: integer
 *               example: 50
 *             maxKeywordsPerPrompt:
 *               type: integer
 *               example: 20
 *
 *     UpgradeBody:
 *       type: object
 *       required: [planId, provider]
 *       properties:
 *         planId:
 *           type: string
 *           description: Plan document ID
 *           example: 64a2f3c8e4b0d12345678901
 *         billing:
 *           type: string
 *           enum: [monthly, yearly]
 *           default: monthly
 *           example: monthly
 *         provider:
 *           type: string
 *           enum: [stripe, paymob]
 *           example: stripe
 *         method:
 *           type: string
 *           enum: [card, wallet]
 *           description: Payment method (optional, provider-dependent)
 *           example: card
 *
 *     CancelBody:
 *       type: object
 *       properties:
 *         reason:
 *           type: string
 *           maxLength: 500
 *           description: Optional cancellation reason
 *           example: "Switching to a different service"
 *
 *     UsageResponse:
 *       type: object
 *       properties:
 *         plan:
 *           type: string
 *           enum: [free, starter, pro, enterprise]
 *           example: starter
 *         tokens:
 *           type: object
 *           properties:
 *             used:
 *               type: integer
 *               example: 12
 *             limit:
 *               type: integer
 *               example: 50
 *             remaining:
 *               type: integer
 *               example: 38
 *             resetsAt:
 *               type: string
 *               format: date-time
 *         billing:
 *           type: object
 *           nullable: true
 *           properties:
 *             subscriptionId:
 *               type: string
 *               example: 64a2f3c8e4b0d12345678901
 */

/**
 * @openapi
 * /api/v1/subscriptions/plans:
 *   get:
 *     tags: [Subscriptions]
 *     summary: List all available subscription plans
 *     description: Returns active plans sorted by tokens per day (ascending).
 *     responses:
 *       200:
 *         description: Plans listed successfully
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
 *                     $ref: '#/components/schemas/PlanSummary'
 */

/**
 * @openapi
 * /api/v1/subscriptions/upgrade:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Upgrade to a paid plan
 *     description: |
 *       Initiates a plan upgrade via Stripe or Paymob.
 *       **Not yet implemented** — returns 500 until Phase 10.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpgradeBody'
 *     responses:
 *       200:
 *         description: Upgrade initiated (Phase 10)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
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
 *       500:
 *         description: Payment integration not implemented yet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/subscriptions/cancel:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Cancel current subscription
 *     description: |
 *       Cancels the user's active subscription.
 *       **Not yet implemented** — returns 500 until Phase 10.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelBody'
 *     responses:
 *       200:
 *         description: Subscription cancelled (Phase 10)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Cancel not implemented yet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/subscriptions/usage:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get current token usage and plan info
 *     description: Returns the user's plan, daily token usage, remaining tokens, and billing info.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usage fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UsageResponse'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
