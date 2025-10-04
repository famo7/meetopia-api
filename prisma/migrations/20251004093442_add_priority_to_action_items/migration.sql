-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "public"."ActionItem" ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM';
