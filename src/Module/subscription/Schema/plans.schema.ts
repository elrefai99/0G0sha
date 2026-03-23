import { Schema, model } from "mongoose";
import { IPlan } from "../@types";

const planSchema = new Schema<IPlan>({
     name: {
          type: String,
          required: true,
     },
     displayName: {
          type: String,
          required: true,
     },
     price: {
          type: Number,
          required: true,
     },
     tokensPerDay: {
          type: Number,
          default: 0,
     },
     features: {
          type: [String],
          default: [],
     },
     limits: {
          type: Object,
          default: {},
     },
     isActive: {
          type: Boolean,
          default: true,
     },
}, { timestamps: true })

export const PlanModel = model<IPlan>('Plan', planSchema)
