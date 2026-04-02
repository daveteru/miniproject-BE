-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MID');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'DRAFT', 'EXPIRED');

-- CreateTable
CREATE TABLE "promotions" (
    "id" SERIAL NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "Status" NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
