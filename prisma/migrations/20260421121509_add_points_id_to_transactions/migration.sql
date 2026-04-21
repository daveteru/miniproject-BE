/*
  Warnings:

  - You are about to drop the column `transactionId` on the `points` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pointsId]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "points" DROP CONSTRAINT "points_transactionId_fkey";

-- AlterTable
ALTER TABLE "points" DROP COLUMN "transactionId";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "pointsId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_pointsId_key" ON "transactions"("pointsId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_pointsId_fkey" FOREIGN KEY ("pointsId") REFERENCES "points"("id") ON DELETE SET NULL ON UPDATE CASCADE;
