import { tokenize, extractKeywords, classify, assessComplexity, extractIntent, detect, calcRawScore, RuleEngine, Merger, Learner, createLogger, } from '@/gen-import';
import type { AgentInput, AgentOutput, AnalysisResult, PromptCategory, } from '../@types/index.js';
import { WeightCache } from './weight-cache.js';

const logger = createLogger('AgentEngine');

const CATEGORIES: PromptCategory[] = ['coding', 'writing', 'analysis', 'marketing', 'general'];

export class AgentEngine {
     private readonly ruleEngine = new RuleEngine();
     private readonly merger = new Merger();
     private readonly learner = new Learner();
     private readonly weightCache = new WeightCache(this.learner);

     async init(): Promise<void> {
          const ruleIds = this.ruleEngine.getRuleIds();
          await Promise.all(
               CATEGORIES.map((category) => this.learner.initWeights(ruleIds, category)),
          );
     }

     async process(input: AgentInput): Promise<AgentOutput> {
          const analysis = this.analyze(input.text);

          let weights: Awaited<ReturnType<Learner['getWeights']>> = [];
          let similar: Awaited<ReturnType<Learner['findSimilar']>> = null;
          try {
               [weights, similar] = await Promise.all([
                    this.weightCache.getWeights(analysis.category),
                    this.learner.findSimilar(input.text, analysis.category),
               ]);
          } catch (err) {
               logger.error({ err }, 'Learn phase failed, using defaults');
          }

          const { result: transformed, appliedRules } = this.ruleEngine.apply(
               input.text,
               analysis,
               input.targetModel,
               weights,
          );

          let optimized = transformed;
          if (similar && similar.score >= 8 && similar.similarity > 0.5) {
               try {
                    optimized = this.merger.merge(transformed, similar.optimizedText);
               } catch (err) {
                    logger.error({ err }, 'Merge phase failed, using pre-merge text');
               }
          }

          const outputAnalysis = this.analyze(optimized);
          const finalScore = outputAnalysis.rawScore;
          const suggestions = this.buildSuggestions(outputAnalysis);
          const tokensCost = this.calcTokenCost(input.text);

          let promptId = '';
          try {
               promptId = await this.learner.recordResult({
                    originalText: input.text,
                    optimizedText: optimized,
                    category: analysis.category,
                    targetModel: input.targetModel,
                    rulesApplied: appliedRules,
                    score: finalScore,
                    keywords: analysis.keywords,
                    tokensCost,
                    userId: input.userId,
               });
          } catch (err) {
               logger.error({ err }, 'Record phase failed, returning result without promptId');
          }

          return {
               promptId,
               original: input.text,
               optimized,
               score: finalScore,
               suggestions,
               analysis,
          };
     }

     async feedback(promptId: string, userScore: number): Promise<void> {
          await this.learner.applyFeedback(promptId, userScore);
          await this.weightCache.invalidateAll().catch((err) => {
               logger.error({ err }, 'Failed to invalidate weight cache');
          });
     }

     calcTokenCost(text: string): number {
          const wordCount = text.split(/\s+/).length;
          if (wordCount <= 50) return 1;
          if (wordCount <= 200) return 3;
          return 5;
     }

     private analyze(text: string): AnalysisResult {
          const tokens = tokenize(text);
          const keywords = extractKeywords(tokens);
          const category = classify(tokens);
          const complexity = assessComplexity(text, keywords);
          const intent = extractIntent(keywords);
          const gaps = detect(text);
          const rawScore = calcRawScore(gaps);
          return { tokens, keywords, category, complexity, intent, gaps, rawScore };
     }

     private buildSuggestions(analysis: AnalysisResult): string[] {
          const suggestions: string[] = [];

          for (const gap of analysis.gaps) {
               if (gap.severity === 'missing') {
                    suggestions.push(
                         `Add ${gap.element}: your prompt would benefit from an explicit ${gap.element} section.`,
                    );
               } else if (gap.severity === 'weak') {
                    suggestions.push(
                         `Strengthen ${gap.element}: it's present but could be more specific.`,
                    );
               }
          }

          if (analysis.rawScore >= 8) {
               suggestions.push('Your prompt is already well-structured. Minor tweaks only.');
          }

          return suggestions;
     }
}
