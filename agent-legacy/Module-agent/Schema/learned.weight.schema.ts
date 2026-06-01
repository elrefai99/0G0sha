import { Schema, model } from "mongoose";
import { ILearnedWeight } from "../@types";

const learnedWeightSchema = new Schema<ILearnedWeight>({
     ruleId: {
          type: String,
          required: true
     },
     category: {
          type: String,
          required: true
     },
     weight: {
          type: Number,
          required: true
     },
     totalUses: {
          type: Number,
          required: true
     },
     totalScore: {
          type: Number,
          required: true
     },
     avgScore: {
          type: Number,
          required: true
     }
}, {
     timestamps: true
})

learnedWeightSchema.index({ ruleId: 1, category: 1 }, { unique: true })

export const LearnedWeightModel = model<ILearnedWeight>('learned_weight', learnedWeightSchema)
