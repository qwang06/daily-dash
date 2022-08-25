SELECT
	u.id,
	u."createdAt",
	u."updatedAt",
	u."email",
	u."password",
	up."prefs"
FROM
	users AS u
LEFT JOIN
	"userPrefs" AS up
ON
	up.users_id = u.id
WHERE
	"email" = $1
;