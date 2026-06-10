import { AnalysisResult } from "@/agent"
import { assessComplexity, classify, extractIntent } from "../../../agent/script/classifier"
import { calcRawScore, detect } from "../../../agent/script/gap-scorer"
import { extractKeywords, tokenize } from "../../../agent/script/tokenizer"

export class AgentService {
     public analyze(text: string): AnalysisResult {
          const tokens = tokenize(text)
          const keywords = extractKeywords(tokens)
          const category = classify(tokens)
          const complexity = assessComplexity(text, keywords)
          const intent = extractIntent(keywords)
          const gaps = detect(text)
          const rawScore = calcRawScore(gaps)

          return {
               tokens,
               keywords,
               category,
               complexity,
               intent,
               gaps,
               rawScore,
          }
     }
}
