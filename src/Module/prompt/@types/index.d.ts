import { Document, Types } from "mongoose";

export interface IPromptHistory extends Document {
     originalText: string;
     optimizedText: string;
     targetModel: string;
     category: string;
     rulesApplied: string[];
     score: number;
     userScore: number | null;
     userId: Types.ObjectId | null;
     keywords: string[];
     tokensCost: number;
}
