UPDATE
	"userPrefs"
SET
	"updatedAt" = NOW(),
	prefs = $2
WHERE
	"users_id" = $1
;