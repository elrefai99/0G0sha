import { AppError, LearnedWeightModel, PromptHistoryModel } from "@/gen-import";
import { LearnedWeight, PromptCategory, SimilarPrompt } from "../@types";

const SIMILARITY_THRESHOLD = 0.3;
const WEIGHT_BOOST = 0.1;
const WEIGHT_PENALTY = 0.05;
const WEIGHT_CAP = 3.0;
const WEIGHT_FLOOR = 0.2;
const SCORE_BOOST_MIN = 7;
const SCORE_PENALIZE_MAX = 5;

export class Learner {
     async findSimilar(text: string, category: PromptCategory): Promise<SimilarPrompt | null> {
          const results = await PromptHistoryModel.find(
               { $text: { $search: text }, category, userScore: { $gte: SCORE_BOOST_MIN } },
               { score: { $meta: 'textScore' } } as any,
          )
               .sort({ score: { $meta: 'textScore' } })
               .limit(3)
               .lean()
               .exec();

          if (results.length === 0) return null;

          const best = results[0];

          // MongoDB textScore is typically 0.5–2.0 for prompt-length texts.
          // Normalize to 0–1 by dividing by 2.
          const textScore = (best as unknown as Record<string, number>).score ?? 0;
          const similarity = Math.min(textScore / 2, 1);

          if (similarity < SIMILARITY_THRESHOLD) return null;

          return {
               originalText: best.originalText,
               optimizedText: best.optimizedText,
               score: best.userScore ?? best.score,
               category: best.category as PromptCategory,
               rulesApplied: best.rulesApplied,
               similarity,
          };
     }

     async getWeights(category: PromptCategory): Promise<LearnedWeight[]> {
          const weights = await LearnedWeightModel.find({ category }).lean().exec();

          return weights.map((w) => ({
               ruleId: w.ruleId,
               category: w.category as PromptCategory,
               weight: w.weight,
               totalUses: w.totalUses,
               avgScore: w.avgScore,
          }));
     }

     async recordResult(params: {
          originalText: string;
          optimizedText: string;
          category: PromptCategory;
          targetModel: string;
          rulesApplied: string[];
          score: number;
          keywords: string[];
          tokensCost: number;
          userId?: string;
     }): Promise<string> {
          const doc = await PromptHistoryModel.create({
               originalText: params.originalText,
               optimizedText: params.optimizedText,
               category: params.category,
               targetModel: params.targetModel,
               rulesApplied: params.rulesApplied,
               score: params.score,
               userScore: null,
               userId: params.userId ?? null,
               keywords: params.keywords,
               tokensCost: params.tokensCost,
          });

          if (params.rulesApplied.length > 0) {
               await this.incrementRuleUsage(params.rulesApplied, params.category);
          }

          return doc._id.toString();
     }

     async applyFeedback(promptId: string, userScore: number): Promise<void> {
          const prompt = await PromptHistoryModel.findById(promptId);
          if (!prompt) throw AppError.notFound('Prompt not found');

          prompt.userScore = userScore;
          await prompt.save();

          await Promise.all(
               prompt.rulesApplied.map((ruleId) =>
                    this.updateRuleWeight(ruleId, prompt.category as PromptCategory, userScore),
               ),
          );
     }

     async initWeights(ruleIds: string[], category: PromptCategory): Promise<void> {
          const ops = ruleIds.map((ruleId) => ({
               updateOne: {
                    filter: { ruleId, category },
                    update: {
                         $setOnInsert: {
                              ruleId,
                              category,
                              weight: 1.0,
                              totalUses: 0,
                              totalScore: 0,
                              avgScore: 0,
                         },
                    },
                    upsert: true,
               },
          }));

          await LearnedWeightModel.bulkWrite(ops);
     }

     // Single atomic pipeline update: score tracking + weight adjustment + avgScore recalc.
     // Replaces the previous 2–3 round-trip approach (updateOne + enforceWeightCap/Floor + recalcAvgScore).
     private async updateRuleWeight(
          ruleId: string,
          category: PromptCategory,
          userScore: number,
     ): Promise<void> {
          const weightDelta =
               userScore >= SCORE_BOOST_MIN ? WEIGHT_BOOST
                    : userScore < SCORE_PENALIZE_MAX ? -WEIGHT_PENALTY
                         : 0;

          const clampedWeight =
               weightDelta > 0
                    ? { $min: [{ $add: ['$weight', weightDelta] }, WEIGHT_CAP] }
                    : weightDelta < 0
                         ? { $max: [{ $add: ['$weight', weightDelta] }, WEIGHT_FLOOR] }
                         : '$weight';

          const newTotalScore = { $add: ['$totalScore', userScore] };
          const newTotalUses = { $add: ['$totalUses', 1] };

          await LearnedWeightModel.updateOne({ ruleId, category }, [
               {
                    $set: {
                         totalScore: newTotalScore,
                         totalUses: newTotalUses,
                         weight: clampedWeight,
                         avgScore: { $round: [{ $divide: [newTotalScore, newTotalUses] }, 2] },
                    },
               },
          ]);
     }

     private async incrementRuleUsage(ruleIds: string[], category: PromptCategory): Promise<void> {
          await LearnedWeightModel.updateMany(
               { ruleId: { $in: ruleIds }, category },
               { $inc: { totalUses: 1 } },
          );
     }
}
