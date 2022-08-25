INSERT INTO
	"userPrefs"
	(
		"createdAt",
		"updatedAt",
		"users_id",
		"prefs"
	)
SELECT
	NOW(),
	NOW(),
	$1,
	$2
FROM
	( SELECT 0 AS anyfield ) AS a
LEFT JOIN
	"userPrefs" AS b
ON
	b.users_id = $1
WHERE
	b.id IS NULL
RETURNING
	id
;