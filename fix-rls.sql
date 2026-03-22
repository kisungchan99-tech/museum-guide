-- Allow everyone to read visits (needed for ranking feature)
-- Drop the old restrictive policy first
drop policy if exists "Users can view own visits" on visits;

-- Allow everyone to read visits (for ranking aggregation)
create policy "Visits are viewable by everyone" on visits for select using (true);
