import { Schema, model } from "mongoose";
import { ITemplate } from "../@types";

const templateSchema = new Schema<ITemplate>({
     name: {
          type: String,
          required: true,
     },
     category: {
          type: String,
          default: "",
     },
     description: {
          type: String,
          default: "",
     },
     systemPrompt: {
          type: String,
          default: "",
     },
     exampleInput: {
          type: String,
          default: "",
     },
     exampleOutput: {
          type: String,
          default: "",
     },
     isActive: {
          type: Boolean,
          default: true,
     },
}, { timestamps: true })

templateSchema.index({ category: 1, isActive: 1 });

export const TemplateModel = model<ITemplate>('Template', templateSchema)
