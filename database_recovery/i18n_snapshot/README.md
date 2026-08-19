# i18n Snapshot — Export Instructions

This folder is intended to hold JSON snapshots of the current translation data per locale.

## Why Placeholder Files

Exporting 2,584+ translation keys per locale inline into documentation files is not practical. Instead, use the SQL below to generate current snapshots directly from the database.

## How to Export

Run this query in the Supabase SQL Editor, replacing `'en'` with the target locale code:

```sql
SELECT json_object_agg(key, value ORDER BY key)
FROM ui_translations
WHERE locale = 'en' AND namespace = 'common'
UNION ALL
SELECT json_object_agg(namespace || '.' || key, value ORDER BY key)
FROM ui_translations
WHERE locale = 'en' AND namespace != 'common';
```

Or, to get a flat map exactly matching what `get_translations_for_locale()` returns:

```sql
SELECT get_translations_for_locale('en');
```

Then copy the JSON output and save it as `en.json`.

## Locale Codes

| File | Locale code | Keys (2026-06-29 baseline) |
|------|-------------|---------------------------|
| en.json | en | 2,584 |
| es.json | es | 1,397 |
| fr.json | fr | 897 |
| de.json | de | 897 |
| it.json | it | 897 |
| sv.json | sv | 1,290 |
| fi.json | fi | 1,290 |
| ja.json | ja | 796 |

## Automation Script (Node.js)

To generate all locale JSON files at once, run this against the Supabase REST API:

```javascript
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const locales = ['en', 'es', 'fr', 'de', 'it', 'sv', 'fi', 'ja'];

for (const locale of locales) {
  const { data, error } = await supabase.rpc('get_translations_for_locale', { p_locale: locale });
  if (error) { console.error(locale, error); continue; }
  writeFileSync(`database_recovery/i18n_snapshot/${locale}.json`, JSON.stringify(data, null, 2));
  console.log(`Exported ${locale}: ${Object.keys(data).length} keys`);
}
```

Save as `scripts/export_i18n_snapshot.mjs` and run with:

```bash
node scripts/export_i18n_snapshot.mjs
```

## Note on Snapshot Timing

Snapshots should be regenerated after any translation migration or bulk translation update. The snapshot files in this folder represent a point-in-time export and will become stale as translations are added.

Snapshot date for the current placeholder: **2026-06-29**
