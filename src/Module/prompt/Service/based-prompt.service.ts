import {
     AgentEngine,
     PromptHistoryModel,
     AppError,
     cacheGet,
     cacheSet,
     hashText,
     createLogger,
} from '@/gen-import';
import type { AgentOutput, TargetModel, PromptCategory } from '@/gen-import';
import type { IPromptHistory } from '../@types/index.js';

const logger = createLogger('PromptService');

const PROMPT_CACHE_TTL = 3600;

const agent = new AgentEngine();

export const initAgent = async (): Promise<void> => {
     await agent.init();
};

export const optimizePrompt = async (
     text: string,
     targetModel: TargetModel,
     userId?: string,
): Promise<AgentOutput> => {
     const cacheKey = `prompt:${hashText(text)}:${targetModel}`;

     try {
          const cached = await cacheGet<AgentOutput>(cacheKey);
          if (cached) {
               logger.debug({ targetModel }, 'Prompt cache hit');
               return cached;
          }
     } catch (err) {
          logger.warn({ err }, 'Prompt cache read failed, running full pipeline');
     }

     const result = await agent.process({ text, targetModel, userId });

     try {
          await cacheSet(cacheKey, result, PROMPT_CACHE_TTL);
     } catch (err) {
          logger.warn({ err }, 'Prompt cache write failed');
     }

     return result;
};

const HISTORY_PROJECTION = {
     originalText: 1,
     optimizedText: 1,
     score: 1,
     userScore: 1,
     category: 1,
     targetModel: 1,
     tokensCost: 1,
     createdAt: 1,
} as const;

export const getHistory = async (
     userId: string,
     page: number,
     limit: number,
     category?: PromptCategory,
): Promise<{ data: IPromptHistory[]; total: number; page: number; limit: number }> => {
     const filter: Record<string, unknown> = { userId };
     if (category) filter.category = category;

     const skip = (page - 1) * limit;

     const [data, total] = await Promise.all([
          PromptHistoryModel.find(filter, HISTORY_PROJECTION)
               .sort({ createdAt: -1 })
               .skip(skip)
               .limit(limit)
               .lean<IPromptHistory[]>()
               .exec(),
          PromptHistoryModel.countDocuments(filter).exec(),
     ]);

     return { data, total, page, limit };
};

export const getPromptById = async (
     promptId: string,
     userId: string,
): Promise<IPromptHistory> => {
     const prompt = await PromptHistoryModel.findOne({ _id: promptId, userId })
          .lean<IPromptHistory>()
          .exec();

     if (!prompt) throw AppError.notFound('Prompt not found');
     return prompt;
};

export const ratePrompt = async (
     promptId: string,
     userId: string,
     score: number,
): Promise<{ promptId: string; score: number }> => {
     const prompt = await PromptHistoryModel.findOne({ _id: promptId, userId })
          .lean()
          .exec();

     if (!prompt) throw AppError.notFound('Prompt not found');

     await agent.feedback(promptId, score);

     return { promptId, score };
};

export const estimateTokenCost = (text: string): number => {
     return agent.calcTokenCost(text);
};
