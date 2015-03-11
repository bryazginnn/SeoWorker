﻿SELECT 
	HTML
FROM
	htmls H
	JOIN spages SP
		ON H.HTML_ID = SP.HTML_ID
	LEFT JOIN scontents SC
		ON SP.SPAGE_ID = SC.SPAGE_ID
WHERE
	SC.SCONTENT_ID IS NULL
ORDER BY 
	SP.DATE_CREATE DESC 
LIMIT 1
;