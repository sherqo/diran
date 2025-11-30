-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('PAGE', 'HEADING_1', 'HEADING_2', 'HEADING_3', 'PARAGRAPH', 'CODE', 'TODO');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('OWNER', 'EDITOR', 'VIEWER', 'NONE');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'TEAM');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('BLOCK', 'TAG');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "refresh_token" TEXT,
    "refresh_token_expires" TIMESTAMPTZ(3),
    "reset_password_token" TEXT,
    "reset_password_expires" TIMESTAMPTZ(3),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp_hashed" TEXT,
    "otp_expires" TIMESTAMPTZ(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "BlockType" NOT NULL,
    "parent_id" UUID,
    "order" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID NOT NULL,
    "actor_type" "ActorType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "role" "RoleType" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_blocks_parent_id" ON "blocks"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "blocks_parent_id_order_key" ON "blocks"("parent_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_actor_id_entity_id_key" ON "permissions"("actor_id", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
