/*
  # Reverse CarerView 1-5 Scale

  ## Summary
  The CarerView ADL scoring scale is being reversed so that:
  - 1 = Fully Independent (was 5)
  - 2 = Independent with Difficulty (was 4)
  - 3 = Independent with Support (unchanged)
  - 4 = Constant Shared Effort (was 2)
  - 5 = Total Assistance (was 1)

  ## Changes

  ### 1. responses table
  - All existing `score` values are transformed using formula: new_score = 6 - old_score
  - This reverses 1↔5 and 2↔4 while keeping 3 unchanged

  ### 2. legend table
  - All existing `score` values are transformed using the same formula: new_score = 6 - old_score
  - Legend descriptions stay with their rows (they move with the score)
  - After this migration the legend rows will have new score numbers matching the new scale meaning

  ## Important Notes
  1. The database constraint on legend.score (1-5 range) remains valid since all values stay within 1-5
  2. Score 3 is unaffected by the 6 - score formula (6 - 3 = 3)
  3. This migration is NOT reversible without running it again (running it twice returns to original)
*/

-- Reverse scores in responses table
UPDATE responses
SET score = 6 - score
WHERE score BETWEEN 1 AND 5;

-- Reverse scores in legend table
-- We must use a temporary offset to avoid unique constraint violations during the update
-- First shift all scores up by 10, then apply the formula, then shift back
UPDATE legend
SET score = score + 10
WHERE score BETWEEN 1 AND 5;

UPDATE legend
SET score = 6 - (score - 10)
WHERE score BETWEEN 11 AND 15;
