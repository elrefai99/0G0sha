import { Schema, model } from "mongoose";
import { ITokenLedger } from "../@types";

const tokenLedgerSchema = new Schema<ITokenLedger>({
     userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
     },
     amount: {
          type: Number,
          required: true,
     },
     action: {
          type: String,
          enum: ['optimize', 'reset', 'bonus', 'refund'],
          required: true,
     },
     promptId: {
          type: Schema.Types.ObjectId,
          ref: 'PromptHistory',
          required: true,
     },
     balanceAfter: {
          type: Number,
          required: true,
     },
     metadata: {
          type: Object,
          required: true,
     },
}, { timestamps: true })

tokenLedgerSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
tokenLedgerSchema.index({ userId: 1, action: 1 });

export const TokenLedgerModel = model<ITokenLedger>('TokenLedger', tokenLedgerSchema)
