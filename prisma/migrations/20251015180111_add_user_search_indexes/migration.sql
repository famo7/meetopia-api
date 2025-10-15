-- CreateIndex
CREATE INDEX "idx_users_name_email" ON "public"."User"("name", "email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "idx_users_name" ON "public"."User"("name");
