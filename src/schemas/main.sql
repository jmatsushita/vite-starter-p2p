CREATE TABLE IF NOT EXISTS test 
  ( site_id TEXT DEFAULT (crsql_site_id())
  , id INTEGER
  , name TEXT
  , PRIMARY KEY (site_id, id));


-- CREATE TRIGGER IF NOT EXISTS autoinc_test_id AFTER INSERT ON test
-- WHEN NEW.id IS NULL
-- BEGIN
--     UPDATE test
--     SET id = IFNULL((SELECT MAX(id) FROM test) + 1, 0)
--     WHERE rowid = NEW.rowid;
-- END;


SELECT crsql_as_crr('test');
