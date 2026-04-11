/**
 * @openapi
 * tags:
 *   name: Templates
 *   description: Pre-built prompt templates by category
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     TemplateSummary:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64a2f3c8e4b0d12345678901
 *         name:
 *           type: string
 *           example: Code Review Assistant
 *         category:
 *           type: string
 *           enum: [coding, writing, analysis, marketing, general]
 *           example: coding
 *         description:
 *           type: string
 *           example: A template for reviewing code with best practices
 *         exampleInput:
 *           type: string
 *           example: "Review this Python function for bugs"
 *         exampleOutput:
 *           type: string
 *           example: "You are an expert code reviewer. Analyze the following..."
 *
 *     TemplateDetail:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64a2f3c8e4b0d12345678901
 *         name:
 *           type: string
 *           example: Code Review Assistant
 *         category:
 *           type: string
 *           example: coding
 *         description:
 *           type: string
 *           example: A template for reviewing code with best practices
 *         systemPrompt:
 *           type: string
 *           example: "You are a senior software engineer performing a thorough code review..."
 *         exampleInput:
 *           type: string
 *           example: "Review this Python function for bugs"
 *         exampleOutput:
 *           type: string
 *           example: "You are an expert code reviewer. Analyze the following..."
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/v1/templates:
 *   get:
 *     tags: [Templates]
 *     summary: List all active templates
 *     description: Returns active templates sorted by category and name. Optionally filter by category.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [coding, writing, analysis, marketing, general]
 *         description: Filter templates by category
 *     responses:
 *       200:
 *         description: Templates listed successfully
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
 *                     $ref: '#/components/schemas/TemplateSummary'
 */

/**
 * @openapi
 * /api/v1/templates/{id}:
 *   get:
 *     tags: [Templates]
 *     summary: Get a single template by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template document ID
 *         example: 64a2f3c8e4b0d12345678901
 *     responses:
 *       200:
 *         description: Template fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TemplateDetail'
 *       404:
 *         description: Template not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
