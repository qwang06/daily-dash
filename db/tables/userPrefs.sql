CREATE TABLE IF NOT EXISTS "userPrefs" (
	id SERIAL,
	"createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	"updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	"users_id" INT NOT NULL,
	"prefs" JSONB,
	CONSTRAINT "userPref_pk" PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "userPref_createdAt"
	ON "userPrefs"
	USING btree
	("createdAt")
;
CREATE INDEX IF NOT EXISTS "userPref_updatedAt"
	ON "userPrefs"
	USING btree
	("updatedAt")
;
CREATE UNIQUE INDEX IF NOT EXISTS "userPref_users_id"
	ON "userPrefs"
	USING btree
	("users_id")
;