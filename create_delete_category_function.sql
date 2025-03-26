CREATE OR REPLACE FUNCTION delete_category(category_id UUID) RETURNS VOID AS $$ BEGIN DELETE FROM event_categories WHERE id = category_id; END; $$ LANGUAGE plpgsql;
