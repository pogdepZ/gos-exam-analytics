-- Expression index on (math + physics + chemistry) DESC
-- Allows PostgreSQL to use an index scan instead of full table scan for Group A rankings query
-- Query pattern: ORDER BY (math + physics + chemistry) DESC WHERE math IS NOT NULL AND physics IS NOT NULL AND chemistry IS NOT NULL
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_group_a_total_score"
ON "exam_results" ((math + physics + chemistry) DESC)
WHERE math IS NOT NULL AND physics IS NOT NULL AND chemistry IS NOT NULL;