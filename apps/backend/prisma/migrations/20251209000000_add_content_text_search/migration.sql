-- Add content_text column for full-text search indexing
ALTER TABLE "blocks" ADD COLUMN "content_text" TEXT;

-- Create a GIN index for full-text search (using simple configuration for better matching)
CREATE INDEX "idx_blocks_content_text_gin" ON "blocks" USING gin(to_tsvector('simple', COALESCE("content_text", '')));

-- Also create a trigram index for ILIKE searches (faster substring matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "idx_blocks_content_text_trgm" ON "blocks" USING gin("content_text" gin_trgm_ops);
