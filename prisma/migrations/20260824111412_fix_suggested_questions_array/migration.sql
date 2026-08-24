/*
  Warnings:

  - The `suggestedQuestions` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "suggestedQuestions",
ADD COLUMN     "suggestedQuestions" TEXT[];
