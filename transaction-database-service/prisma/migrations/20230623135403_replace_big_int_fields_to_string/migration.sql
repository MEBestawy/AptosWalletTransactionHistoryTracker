-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "version" SET DATA TYPE TEXT,
ALTER COLUMN "timestamp" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "last_updated" SET DATA TYPE TEXT;
