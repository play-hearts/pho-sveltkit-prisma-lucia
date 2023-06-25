/*
  Warnings:

  - The primary key for the `Round` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Round` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tableId,round]` on the table `Round` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Round_tableId_round_idx";

-- AlterTable
ALTER TABLE "Round" DROP CONSTRAINT "Round_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "Round_tableId_round_key" ON "Round"("tableId", "round");
