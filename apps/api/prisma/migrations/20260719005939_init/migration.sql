-- CreateTable
CREATE TABLE "exam_results" (
    "id" TEXT NOT NULL,
    "registration_number" TEXT NOT NULL,
    "math" DOUBLE PRECISION,
    "literature" DOUBLE PRECISION,
    "foreign_language" DOUBLE PRECISION,
    "physics" DOUBLE PRECISION,
    "chemistry" DOUBLE PRECISION,
    "biology" DOUBLE PRECISION,
    "history" DOUBLE PRECISION,
    "geography" DOUBLE PRECISION,
    "civic_education" DOUBLE PRECISION,
    "foreign_language_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_registration_number_key" ON "exam_results"("registration_number");

-- CreateIndex
CREATE INDEX "exam_results_registration_number_idx" ON "exam_results"("registration_number");

-- CreateIndex
CREATE INDEX "exam_results_math_physics_chemistry_idx" ON "exam_results"("math", "physics", "chemistry");
