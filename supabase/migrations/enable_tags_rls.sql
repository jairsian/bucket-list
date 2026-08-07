-- Enable RLS on tags table if not already enabled
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own tags
CREATE POLICY "Users can insert their own tags"
ON tags FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to select their own tags
CREATE POLICY "Users can view their own tags"
ON tags FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own tags
CREATE POLICY "Users can update their own tags"
ON tags FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own tags
CREATE POLICY "Users can delete their own tags"
ON tags FOR DELETE
USING (auth.uid() = user_id);

-- Do the same for item_tags junction table
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

-- Allow users to insert item_tags for their own items
CREATE POLICY "Users can insert tags for their items"
ON item_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM items
    WHERE items.id = item_tags.item_id
    AND items.user_id = auth.uid()
  )
);

-- Allow users to select item_tags for their own items
CREATE POLICY "Users can view tags for their items"
ON item_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM items
    WHERE items.id = item_tags.item_id
    AND items.user_id = auth.uid()
  )
);

-- Allow users to delete item_tags for their own items
CREATE POLICY "Users can delete tags from their items"
ON item_tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM items
    WHERE items.id = item_tags.item_id
    AND items.user_id = auth.uid()
  )
);
