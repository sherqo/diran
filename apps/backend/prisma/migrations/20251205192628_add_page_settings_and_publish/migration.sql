-- CreateEnum
CREATE TYPE "PublicAccessType" AS ENUM ('NONE', 'VIEW');

-- CreateTable
CREATE TABLE "page_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "block_id" UUID NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "public_access" "PublicAccessType" NOT NULL DEFAULT 'NONE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "page_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_settings_block_id_key" ON "page_settings"("block_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_settings_slug_key" ON "page_settings"("slug");

-- CreateIndex
CREATE INDEX "idx_page_settings_slug" ON "page_settings"("slug");

-- AddForeignKey
ALTER TABLE "page_settings" ADD CONSTRAINT "page_settings_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
