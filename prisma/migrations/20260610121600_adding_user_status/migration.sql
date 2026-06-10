-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'pending', 'ban', 'delete');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'pending';
