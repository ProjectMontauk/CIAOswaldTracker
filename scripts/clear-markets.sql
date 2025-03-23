-- First, delete all predictions (due to foreign key constraints)
DELETE FROM predictions;

-- Then delete all evidence and votes
DELETE FROM evidence_votes;
DELETE FROM evidence;

-- Finally, delete all markets
DELETE FROM markets;

-- Reset the sequence for market IDs to start from 1 again
ALTER SEQUENCE markets_id_seq RESTART WITH 1;
ALTER SEQUENCE predictions_id_seq RESTART WITH 1;
ALTER SEQUENCE evidence_id_seq RESTART WITH 1;
ALTER SEQUENCE evidence_votes_id_seq RESTART WITH 1; 