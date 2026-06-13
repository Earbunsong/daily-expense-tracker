/*
  Warnings:

  - A unique constraint covering the columns `[userId,month,currency]` on the table `Budget` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Budget_userId_month_key";

-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(14,2);

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(14,2);

-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_month_currency_key" ON "Budget"("userId", "month", "currency");
