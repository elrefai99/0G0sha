-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('free', 'starter', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('upload', 'comment', 'like', 'system');

-- CreateEnum
CREATE TYPE "TokenLedgerAction" AS ENUM ('optimize', 'reset', 'bonus', 'refund');

-- CreateEnum
CREATE TYPE "PlanProvider" AS ENUM ('stripe', 'paymob');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('succeeded', 'pending', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('card', 'wallet');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "username" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT '',
    "apiKey" TEXT NOT NULL,
    "googleId" TEXT NOT NULL DEFAULT '',
    "plan" "UserPlan" NOT NULL DEFAULT 'free',
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "tokensLimit" INTEGER NOT NULL DEFAULT 10,
    "tokensLastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "seenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "tokensPerDay" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT[],
    "limits" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "action" "TokenLedgerAction" NOT NULL,
    "promptId" TEXT,
    "balanceAfter" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "provider" "PlanProvider" NOT NULL DEFAULT 'paymob',
    "method" "PaymentMethod" NOT NULL DEFAULT 'card',
    "transaction_id" TEXT NOT NULL DEFAULT '',
    "server_message" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_apiKey_key" ON "users"("apiKey");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_userId_seen_idx" ON "notifications"("userId", "seen");

-- CreateIndex
CREATE INDEX "token_ledger_createdAt_idx" ON "token_ledger"("createdAt");

-- CreateIndex
CREATE INDEX "token_ledger_userId_action_idx" ON "token_ledger"("userId", "action");

-- CreateIndex
CREATE INDEX "payment_history_userId_createdAt_idx" ON "payment_history"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "payment_history_order_id_idx" ON "payment_history"("order_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_ledger" ADD CONSTRAINT "token_ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
