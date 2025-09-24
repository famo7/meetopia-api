/*
  Warnings:

  - A unique constraint covering the columns `[shareLink]` on the table `Meeting` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,meetingId]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `ActionItem` table without a default value. This is not possible if the table is not empty.
  - The required column `shareLink` was added to the `Meeting` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "public"."ActionItem" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Meeting" ADD COLUMN     "shareLink" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_shareLink_key" ON "public"."Meeting"("shareLink");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_userId_meetingId_key" ON "public"."Participant"("userId", "meetingId");
