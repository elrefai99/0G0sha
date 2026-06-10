import { UserPlan, UserStatus } from '@/generated/prisma';
import type { Request } from 'express'
import type { ProjectionType, QueryOptions, Types } from 'mongoose'

export interface PaginationParams {
     page?: number;
     limit?: number;
}

export interface PaginationMeta {
     total: number;
     page: number;
     limit: number;
     totalPages: number;
     hasNext: boolean;
     hasPrev: boolean;
}

export interface PaginatedResult<T> {
     data: T[];
     meta: PaginationMeta;
}

export interface PaginateOptions<T> {
     filter?: any;
     projection?: ProjectionType<T>;
     options?: QueryOptions<T>;
     params?: PaginationParams;
}

export interface IUserRequest {
     id?: number | string
     _id?: number | string | Types.ObjectId
     fullname?: string
     username?: string
     email?: string
     password?: string
     code?: string
     phone?: string
     avatar?: string
     status?: UserStatus
     apiKey?: string
     googleId?: string
     plan?: UserPlan
     tokensUsed?: number
     tokensLimit?: number
     tokensLastResetAt?: Date | string | any
     subscriptionId?: string
     notifications?: any
     tokenLedgers?: any
     paymentHistory?: any
     createdAt?: Date
     updatedAt?: Date
}

export interface Token {
     word: string;
     isKeyword: boolean;
     weight: number;
}

export interface PromptGap {
     element: PromptElement;
     severity: 'missing' | 'weak' | 'ok';
}

export interface AnalysisResult {
     tokens: Token[];
     keywords: string[];
     category: PromptCategory;
     complexity: PromptComplexity;
     intent: string;
     gaps: PromptGap[];
     rawScore: number;
}

export interface TransformRule {
     id: string;
     name: string;
     element: PromptElement;
     condition: (analysis: AnalysisResult) => boolean;
     apply: (text: string, analysis: AnalysisResult, target: TargetModel) => string;
}

export interface LearnedWeight {
     ruleId: string;
     category: PromptCategory;
     weight: number;
     totalUses: number;
     avgScore: number;
}

export interface SimilarPrompt {
     originalText: string;
     optimizedText: string;
     score: number;
     category: PromptCategory;
     rulesApplied: string[];
     similarity: number;
}

export interface AgentInput {
     text: string;
     targetModel: TargetModel;
     userId?: string;
}

export interface AgentOutput {
     promptId: string;
     original: string;
     optimized: string;
     score: number;
     suggestions: string[];
     analysis: {
          category: PromptCategory;
          complexity: PromptComplexity;
          gaps: PromptGap[];
          rulesApplied: string[];
          learnedFromPast: boolean;
     };
}
