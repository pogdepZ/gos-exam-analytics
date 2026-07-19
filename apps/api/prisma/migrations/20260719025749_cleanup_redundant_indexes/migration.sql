-- Drop redundant index on registration_number
-- The UNIQUE index "exam_results_registration_number_key" already serves as a B-tree index
-- Keeping both wastes storage (~30-50MB on 1M rows) and slows down writes
DROP INDEX IF EXISTS "exam_results_registration_number_idx";

-- Drop the old generic 3-column index — replaced by the expression index idx_group_a_total_score
-- This index was never useful since queries use ORDER BY (math+physics+chemistry), not individual columns
DROP INDEX IF EXISTS "exam_results_math_physics_chemistry_idx";