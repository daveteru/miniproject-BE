-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_transactionId_fkey";

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "transactionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
