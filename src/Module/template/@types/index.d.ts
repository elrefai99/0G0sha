import { Document } from "mongoose";

export interface ITemplate extends Document {
     name: string;
     category: string;
     description: string;
     systemPrompt: string;
     exampleInput: string;
     exampleOutput: string;
     isActive: boolean;
}
