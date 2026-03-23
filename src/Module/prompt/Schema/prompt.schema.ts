import { Schema, model } from "mongoose";
import { IPromptHistory } from "../@types";

const promptSchema = new Schema<IPromptHistory>({
     originalText: {
          type: String,
          required: true
     },
     optimizedText: {
          type: String,
          required: true
     },
     targetModel: {
          type: String,
          required: true
     },
     category: {
          type: String,
          required: true
     },
     rulesApplied: {
          type: [String],
          required: true
     },
     score: {
          type: Number,
          required: true
     },
     userScore: {
          type: Number,
          required: true
     },
     userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
     },
     keywords: {
          type: [String],
          default: []
     },
     tokensCost: {
          type: Number,
          default: 0
     }
}, {
     timestamps: true
})

promptSchema.index({ originalText: 'text', keywords: 'text' })
promptSchema.index({ category: 1, userScore: -1 })
promptSchema.index({ userId: 1, createdAt: -1 })

export const PromptHistoryModel = model<IPromptHistory>('prompt_history', promptSchema)
