INSERT INTO
	users
	(
		"createdAt",
		"updatedAt",
		"email",
		"password"
	)
SELECT
	NOW(),
	NOW(),
	$1,
	$2
FROM
	( SELECT 0 AS anyfield ) AS a
LEFT JOIN
	users AS b
ON
	b.email = $1
WHERE
	b.id IS NULL
RETURNING
	id
;