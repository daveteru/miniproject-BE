/*
  Warnings:

  - A unique constraint covering the columns `[referral]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "referral" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_key" ON "users"("referral");
