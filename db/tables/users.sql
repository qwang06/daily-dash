CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	"createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	"updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	"email" TEXT,
	"password" CHARACTER VARYING
);

CREATE INDEX IF NOT EXISTS "user_createdAt"
	ON users
	USING btree
	("createdAt")
;
CREATE INDEX IF NOT EXISTS "user_updatedAt"
	ON users
	USING btree
	("updatedAt")
;
CREATE UNIQUE INDEX IF NOT EXISTS "user_email"
	ON users
	USING btree
	("email" COLLATE pg_catalog."default" ASC)
;
