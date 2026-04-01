/*
  Warnings:

  - You are about to drop the column `pointUsedId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `_CouponToTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TransactionToVoucher` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `organizerID` to the `vouchers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CouponToTransaction" DROP CONSTRAINT "_CouponToTransaction_A_fkey";

-- DropForeignKey
ALTER TABLE "_CouponToTransaction" DROP CONSTRAINT "_CouponToTransaction_B_fkey";

-- DropForeignKey
ALTER TABLE "_TransactionToVoucher" DROP CONSTRAINT "_TransactionToVoucher_A_fkey";

-- DropForeignKey
ALTER TABLE "_TransactionToVoucher" DROP CONSTRAINT "_TransactionToVoucher_B_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_pointUsedId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "pointUsedId",
ADD COLUMN     "pointsUsed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "vouchers" ADD COLUMN     "organizerID" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_CouponToTransaction";

-- DropTable
DROP TABLE "_TransactionToVoucher";

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_organizerID_fkey" FOREIGN KEY ("organizerID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
