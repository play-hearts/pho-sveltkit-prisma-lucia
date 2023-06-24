-- CreateEnum
CREATE TYPE "Variant" AS ENUM ('STANDARD', 'JACK', 'SPADES');

-- CreateEnum
CREATE TYPE "TableState" AS ENUM ('OPEN', 'PLAYING', 'DONE');

-- CreateEnum
CREATE TYPE "RoundState" AS ENUM ('BIDDING', 'PLAYING', 'DONE');

-- CreateTable
CREATE TABLE "GameTable" (
    "id" TEXT NOT NULL,
    "players" JSONB NOT NULL DEFAULT '{}',
    "variant" "Variant" NOT NULL DEFAULT 'STANDARD',
    "state" "TableState" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "GameTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" SERIAL NOT NULL,
    "tableId" TEXT NOT NULL,
    "round" SERIAL NOT NULL,
    "dealIndex" BIGINT NOT NULL,
    "passOffset" INTEGER NOT NULL DEFAULT 0,
    "state" "RoundState" NOT NULL DEFAULT 'BIDDING',
    "bids" JSONB NOT NULL DEFAULT '{}',
    "plays" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "GameTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
