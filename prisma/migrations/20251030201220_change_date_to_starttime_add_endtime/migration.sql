/*
  Warnings:

  - You are about to drop the column `date` on the `Meeting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Meeting" DROP COLUMN "date",
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
