-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "ingredientId" INTEGER;

-- CreateIndex
CREATE INDEX "Product_ingredientId_idx" ON "Product"("ingredientId");
