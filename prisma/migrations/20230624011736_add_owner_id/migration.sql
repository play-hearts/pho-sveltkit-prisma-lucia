/*
  Warnings:

  - Added the required column `ownerId` to the `GameTable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameTable" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "GameTable" ADD CONSTRAINT "GameTable_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
