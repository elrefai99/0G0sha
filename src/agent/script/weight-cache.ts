import { cacheGet, cacheSet, cacheDel, createLogger } from '@/gen-import';
import type { PromptCategory, LearnedWeight } from '../@types/index.js';
import type { Learner } from './learner.js';

const logger = createLogger('WeightCache');

const WEIGHT_CACHE_TTL = 300;
const CATEGORIES: PromptCategory[] = ['coding', 'writing', 'analysis', 'marketing', 'general'];

export class WeightCache {
     constructor(private readonly learner: Learner) {}

     async getWeights(category: PromptCategory): Promise<LearnedWeight[]> {
          const key = `weights:${category}`;

          try {
               const cached = await cacheGet<LearnedWeight[]>(key);
               if (cached) {
                    logger.debug({ category }, 'Weight cache hit');
                    return cached;
               }
          } catch (err) {
               logger.warn({ err, category }, 'Weight cache read failed, falling back to DB');
          }

          const weights = await this.learner.getWeights(category);

          try {
               await cacheSet(key, weights, WEIGHT_CACHE_TTL);
          } catch (err) {
               logger.warn({ err, category }, 'Weight cache write failed');
          }

          return weights;
     }

     async invalidate(category: PromptCategory): Promise<void> {
          await cacheDel(`weights:${category}`);
     }

     async invalidateAll(): Promise<void> {
          await Promise.all(CATEGORIES.map((c) => cacheDel(`weights:${c}`)));
     }
}
