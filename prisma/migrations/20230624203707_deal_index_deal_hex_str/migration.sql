/*
  Warnings:

  - You are about to drop the column `dealIndex` on the `Round` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Round" DROP COLUMN "dealIndex",
ADD COLUMN     "dealHexStr" TEXT NOT NULL DEFAULT 'deadbeef';
