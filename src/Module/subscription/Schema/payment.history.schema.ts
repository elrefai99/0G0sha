
import { Schema, model } from "mongoose";
import { IPaymentHistory } from "../@types";
import { PAYMENT_METHOD, PAYMENT_STATUS, PLAN_PROVIDER } from "@/gen-import";

const paymentHistorySchema = new Schema<IPaymentHistory>({
     userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
     },
     planId: {
          type: Schema.Types.ObjectId,
          ref: 'Plan',
          required: true,
     },
     order_id: {
          type: String,
          required: true,
     },
     amount: {
          type: Number,
          required: true,
     },
     currency: {
          type: String,
          required: true,
     },
     status: {
          type: String,
          enum: PAYMENT_STATUS,
          default: PAYMENT_STATUS.PENDING,
     },
     provider: {
          type: String,
          enum: PLAN_PROVIDER,
          default: PLAN_PROVIDER.PAYMOB,
     },
     method: {
          type: String,
          enum: PAYMENT_METHOD,
          default: PAYMENT_METHOD.CARD,
     },
     transaction_id: {
          type: String,
          default: "",
     },
     server_message: {
          type: String,
          default: "",
     },
     expiresAt: {
          type: Date,
          default: Date.now() + 30 * 24 * 60 * 60 * 1000,
     },
     isExpired: {
          type: Boolean,
          default: false,
     },
}, { timestamps: true })

paymentHistorySchema.index({ userId: 1, createdAt: -1 });
paymentHistorySchema.index({ order_id: 1 });
export const PaymentHistoryModel = model<IPaymentHistory>('PaymentHistory', paymentHistorySchema)
