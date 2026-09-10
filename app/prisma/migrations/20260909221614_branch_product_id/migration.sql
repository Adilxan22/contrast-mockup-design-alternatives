-- CreateTable
CREATE TABLE "BranchProductId" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "branch" TEXT NOT NULL,
    "posterProductId" INTEGER NOT NULL,

    CONSTRAINT "BranchProductId_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BranchProductId_productId_branch_key" ON "BranchProductId"("productId", "branch");

-- AddForeignKey
ALTER TABLE "BranchProductId" ADD CONSTRAINT "BranchProductId_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
