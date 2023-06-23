/*
  Warnings:

  - Changed the type of `last_updated` on the `Wallet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "last_updated",
ADD COLUMN     "last_updated" BIGINT NOT NULL DEFAULT 0;
