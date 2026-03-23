import { Document, Types } from "mongoose";

export interface IPromptHistory extends Document {
     originalText: string;
     optimizedText: string;
     targetModel: string;
     category: string;
     rulesApplied: string[];
     score: number;
     userScore: number;
     userId: Types.ObjectId;
     keywords: string[];
     tokensCost: number;
}
