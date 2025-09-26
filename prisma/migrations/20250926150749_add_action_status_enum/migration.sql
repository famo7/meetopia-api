-- CreateEnum
CREATE TYPE "public"."ActionItemStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE');

-- AlterTable
ALTER TABLE "public"."ActionItem" ADD COLUMN     "status" "public"."ActionItemStatus" NOT NULL DEFAULT 'OPEN';
