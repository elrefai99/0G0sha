import { Document, Types } from "mongoose";
import { PAYMENT_METHOD, PAYMENT_STATUS, PLAN_PROVIDER } from "@/gen-import";

export interface IPlan extends Document {
     name: string;
     displayName: string;
     price: number;
     tokensPerDay: number;
     features: string[];
     limits: {
          maxPromptsPerDay: number;
          maxKeywordsPerPrompt: number;
     };
     isActive: boolean;
}

export interface ITokenLedger extends Document {
     userId: Types.ObjectId;
     amount: number;
     action: string;
     promptId: Types.ObjectId;
     balanceAfter: number;
     metadata: Record<string, any>;
}

export interface IPaymentHistory extends Document {
     userId: Types.ObjectId;
     planId: Types.ObjectId;
     amount: number;
     currency: string;
     status: PAYMENT_STATUS;
     provider: PLAN_PROVIDER;
     method: PAYMENT_METHOD;
     transaction_id: string;
     order_id: string;
     server_message: string;
     expiresAt: Date;
     isExpired: boolean;
}
