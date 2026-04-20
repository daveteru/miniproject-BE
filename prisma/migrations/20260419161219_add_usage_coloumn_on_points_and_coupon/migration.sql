-- CreateEnum
CREATE TYPE "Usage" AS ENUM ('HOLD', 'FREE', 'USED');

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "usage" "Usage" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "points" ADD COLUMN     "usage" "Usage" NOT NULL DEFAULT 'FREE';
