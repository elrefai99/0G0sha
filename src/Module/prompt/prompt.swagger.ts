/**
 * @openapi
 * tags:
 *   name: Prompts
 *   description: Prompt optimization, history, and rating
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     OptimizeBody:
 *       type: object
 *       required: [text]
 *       properties:
 *         text:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 *           example: "Write a function that sorts an array"
 *         targetModel:
 *           type: string
 *           enum: [claude, gpt, general]
 *           default: general
 *           example: claude
 *
 *     RateBody:
 *       type: object
 *       required: [score]
 *       properties:
 *         score:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           example: 8
 *
 *     AnalysisDetail:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *           enum: [coding, writing, analysis, marketing, general]
 *           example: coding
 *         complexity:
 *           type: string
 *           example: moderate
 *         gaps:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               element:
 *                 type: string
 *                 example: context
 *               severity:
 *                 type: string
 *                 enum: [missing, weak, ok]
 *                 example: weak
 *         rulesApplied:
 *           type: array
 *           items:
 *             type: string
 *           example: [add_role, add_context, structure_task]
 *         learnedFromPast:
 *           type: boolean
 *           example: true
 *
 *     OptimizeResult:
 *       type: object
 *       properties:
 *         promptId:
 *           type: string
 *           example: 64a2f3c8e4b0d12345678901
 *         original:
 *           type: string
 *           example: "Write a function that sorts an array"
 *         optimized:
 *           type: string
 *           example: "You are an expert software engineer. Write a well-documented function..."
 *         score:
 *           type: number
 *           example: 8.5
 *         suggestions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Add specific language constraint", "Include expected output format"]
 *         analysis:
 *           $ref: '#/components/schemas/AnalysisDetail'
 *
 *     TokenUsage:
 *       type: object
 *       properties:
 *         tokensUsed:
 *           type: integer
 *           example: 3
 *         tokensRemaining:
 *           type: integer
 *           example: 47
 *         dailyLimit:
 *           type: integer
 *           example: 50
 *         resetsAt:
 *           type: string
 *           format: date-time
 *
 *     PromptHistoryItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64a2f3c8e4b0d12345678901
 *         originalText:
 *           type: string
 *           example: "Write a function that sorts an array"
 *         optimizedText:
 *           type: string
 *           example: "You are an expert software engineer..."
 *         score:
 *           type: number
 *           example: 8.5
 *         userScore:
 *           type: integer
 *           example: 9
 *         category:
 *           type: string
 *           enum: [coding, writing, analysis, marketing, general]
 *           example: coding
 *         targetModel:
 *           type: string
 *           example: claude
 *         tokensCost:
 *           type: integer
 *           example: 3
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 42
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         totalPages:
 *           type: integer
 *           example: 3
 *
 *     TokenLimitError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Daily token limit reached
 *         usage:
 *           type: object
 *           properties:
 *             tokensUsed:
 *               type: integer
 *               example: 10
 *             tokensLimit:
 *               type: integer
 *               example: 10
 *             tokensRemaining:
 *               type: integer
 *               example: 0
 *             resetsAt:
 *               type: string
 *               format: date-time
 */

/**
 * @openapi
 * /api/v1/prompts/optimize:
 *   post:
 *     tags: [Prompts]
 *     summary: Optimize a prompt using the AI agent engine
 *     description: |
 *       Runs the full 5-phase processing loop: analyze, learn, transform, merge, record.
 *       Consumes Gosha tokens based on prompt complexity (1/3/5 tokens).
 *       Cached results return instantly at 0 token cost.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OptimizeBody'
 *     responses:
 *       200:
 *         description: Prompt optimized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/OptimizeResult'
 *                 usage:
 *                   $ref: '#/components/schemas/TokenUsage'
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
 *       429:
 *         description: Daily token limit reached
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenLimitError'
 */

/**
 * @openapi
 * /api/v1/prompts/history:
 *   get:
 *     tags: [Prompts]
 *     summary: Get paginated prompt optimization history
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [coding, writing, analysis, marketing, general]
 *         description: Filter by prompt category
 *     responses:
 *       200:
 *         description: History fetched successfully
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
 *                     $ref: '#/components/schemas/PromptHistoryItem'
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
 * /api/v1/prompts/{id}:
 *   get:
 *     tags: [Prompts]
 *     summary: Get a single prompt by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prompt history document ID
 *         example: 64a2f3c8e4b0d12345678901
 *     responses:
 *       200:
 *         description: Prompt fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PromptHistoryItem'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Prompt not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/prompts/{id}/rate:
 *   patch:
 *     tags: [Prompts]
 *     summary: Rate a previously optimized prompt
 *     description: |
 *       Submit a 1–10 score for a prompt. This feedback adjusts learned rule weights:
 *       score >= 7 boosts weights by +0.1, score < 5 penalizes by -0.05.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prompt history document ID
 *         example: 64a2f3c8e4b0d12345678901
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RateBody'
 *     responses:
 *       200:
 *         description: Rating saved and weights updated
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
 *                   properties:
 *                     promptId:
 *                       type: string
 *                       example: 64a2f3c8e4b0d12345678901
 *                     score:
 *                       type: integer
 *                       example: 8
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
 *       404:
 *         description: Prompt not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
