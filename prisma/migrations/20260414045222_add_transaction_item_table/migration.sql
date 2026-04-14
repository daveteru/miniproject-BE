/*
  Warnings:

  - You are about to drop the column `ticketId` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_ticketId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "ticketId";

-- CreateTable
CREATE TABLE "transactionitems" (
    "id" TEXT NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "transactionitems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactionitems" ADD CONSTRAINT "transactionitems_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactionitems" ADD CONSTRAINT "transactionitems_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
