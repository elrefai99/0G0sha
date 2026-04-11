/**
 * @openapi
 * tags:
 *   name: Agent
 *   description: Raw prompt analysis (Phase 1 only — tokenize, classify, score)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     AnalyzeBody:
 *       type: object
 *       required: [text]
 *       properties:
 *         text:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 *           example: "Explain how binary search works"
 *         targetModel:
 *           type: string
 *           enum: [claude, gpt, general]
 *           description: Optional target model hint
 *           example: general
 *
 *     AnalysisToken:
 *       type: object
 *       properties:
 *         word:
 *           type: string
 *           example: binary
 *         isKeyword:
 *           type: boolean
 *           example: true
 *         weight:
 *           type: number
 *           example: 1.5
 *
 *     AnalysisGap:
 *       type: object
 *       properties:
 *         element:
 *           type: string
 *           example: context
 *         severity:
 *           type: string
 *           enum: [missing, weak, ok]
 *           example: missing
 *
 *     AnalysisResult:
 *       type: object
 *       properties:
 *         tokens:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AnalysisToken'
 *         keywords:
 *           type: array
 *           items:
 *             type: string
 *           example: [binary, search, explain]
 *         category:
 *           type: string
 *           enum: [coding, writing, analysis, marketing, general]
 *           example: coding
 *         complexity:
 *           type: string
 *           example: simple
 *         intent:
 *           type: string
 *           example: explain
 *         gaps:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AnalysisGap'
 *         rawScore:
 *           type: number
 *           example: 4.5
 */

/**
 * @openapi
 * /api/v1/agent/analyze:
 *   post:
 *     tags: [Agent]
 *     summary: Analyze a prompt without optimizing it
 *     description: |
 *       Runs Phase 1 of the engine only: tokenize, classify category, assess complexity,
 *       extract intent, detect gaps, and calculate a raw quality score (1–10).
 *       Does not consume tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnalyzeBody'
 *     responses:
 *       200:
 *         description: Analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AnalysisResult'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
