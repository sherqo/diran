-- AlterTable
ALTER TABLE "page_settings" ADD COLUMN     "show_in_feed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "idx_page_settings_show_in_feed" ON "page_settings"("show_in_feed");
