/*
  # Update Scale Translation Labels to Reflect Reversed Scale

  ## Summary
  Updates all i18n translation keys in the ui_translations table for the scale labels
  and direction hints to reflect the new reversed scale:
  - scale.1 = Fully Independent (was Total Assistance)
  - scale.2 = Independent with Difficulty (was Constant Shared Effort)
  - scale.3 = Independent with Support (unchanged)
  - scale.4 = Constant Shared Effort (was Independent with Difficulty)
  - scale.5 = Total Assistance (was Fully Independent)

  ## Languages Updated
  - English (en)
  - Spanish (es)
  - Swedish (sv)
  - Finnish (fi)

  ## Direction Labels Swapped
  - scale.more_help / landing.scale_more_help: now "More independent" (score 1 side)
  - scale.more_independent / landing.scale_more_indep: now "More assistance needed" (score 5 side)
  - landing.scale_summary: updated to reference new order
*/

-- English scale labels (swap 1↔5 and 2↔4, keep 3)
UPDATE ui_translations SET value = 'Fully Independent'           WHERE locale = 'en' AND key = 'scale.1';
UPDATE ui_translations SET value = 'Independent with Difficulty' WHERE locale = 'en' AND key = 'scale.2';
UPDATE ui_translations SET value = 'Constant Shared Effort'      WHERE locale = 'en' AND key = 'scale.4';
UPDATE ui_translations SET value = 'Total Assistance'            WHERE locale = 'en' AND key = 'scale.5';

-- English direction / summary labels
UPDATE ui_translations SET value = 'More independent'            WHERE locale = 'en' AND key = 'landing.scale_more_help';
UPDATE ui_translations SET value = 'More assistance needed'      WHERE locale = 'en' AND key = 'landing.scale_more_indep';
UPDATE ui_translations SET value = 'From "Fully Independent" to "Total Assistance" — a clear framework for observing daily living activities'
  WHERE locale = 'en' AND key = 'landing.scale_summary';
UPDATE ui_translations SET value = 'More independent'            WHERE locale = 'en' AND key = 'scale.more_help';
UPDATE ui_translations SET value = 'More assistance needed'      WHERE locale = 'en' AND key = 'scale.more_independent';

-- Spanish scale labels
UPDATE ui_translations SET value = 'Completamente Independiente'   WHERE locale = 'es' AND key = 'scale.1';
UPDATE ui_translations SET value = 'Independiente con Dificultad'  WHERE locale = 'es' AND key = 'scale.2';
UPDATE ui_translations SET value = 'Esfuerzo Compartido Constante' WHERE locale = 'es' AND key = 'scale.4';
UPDATE ui_translations SET value = 'Asistencia Total'              WHERE locale = 'es' AND key = 'scale.5';

UPDATE ui_translations SET value = 'Más independiente'             WHERE locale = 'es' AND key = 'landing.scale_more_help';
UPDATE ui_translations SET value = 'Más asistencia necesaria'      WHERE locale = 'es' AND key = 'landing.scale_more_indep';
UPDATE ui_translations SET value = 'De "Completamente Independiente" a "Asistencia Total" — un marco claro para observar las actividades de la vida diaria'
  WHERE locale = 'es' AND key = 'landing.scale_summary';
UPDATE ui_translations SET value = 'Más independiente'             WHERE locale = 'es' AND key = 'scale.more_help';
UPDATE ui_translations SET value = 'Más asistencia necesaria'      WHERE locale = 'es' AND key = 'scale.more_independent';

-- Swedish scale labels
UPDATE ui_translations SET value = 'Helt självständig'             WHERE locale = 'sv' AND key = 'scale.1';
UPDATE ui_translations SET value = 'Självständig med svårighet'    WHERE locale = 'sv' AND key = 'scale.2';
UPDATE ui_translations SET value = 'Konstant delad ansträngning'   WHERE locale = 'sv' AND key = 'scale.4';
UPDATE ui_translations SET value = 'Total assistans'               WHERE locale = 'sv' AND key = 'scale.5';

UPDATE ui_translations SET value = 'Mer självständig'              WHERE locale = 'sv' AND key = 'landing.scale_more_help';
UPDATE ui_translations SET value = 'Mer assistans behövs'          WHERE locale = 'sv' AND key = 'landing.scale_more_indep';
UPDATE ui_translations SET value = 'Från "Helt självständig" till "Total assistans" — ett tydligt ramverk för att observera dagliga aktiviteter'
  WHERE locale = 'sv' AND key = 'landing.scale_summary';
UPDATE ui_translations SET value = 'Mer självständig'              WHERE locale = 'sv' AND key = 'scale.more_help';
UPDATE ui_translations SET value = 'Mer assistans behövs'          WHERE locale = 'sv' AND key = 'scale.more_independent';

-- Finnish scale labels
UPDATE ui_translations SET value = 'Täysin itsenäinen'             WHERE locale = 'fi' AND key = 'scale.1';
UPDATE ui_translations SET value = 'Itsenäinen vaikeuksin'         WHERE locale = 'fi' AND key = 'scale.2';
UPDATE ui_translations SET value = 'Jatkuva jaettu ponnistus'      WHERE locale = 'fi' AND key = 'scale.4';
UPDATE ui_translations SET value = 'Täysi apu'                     WHERE locale = 'fi' AND key = 'scale.5';

UPDATE ui_translations SET value = 'Enemmän itsenäinen'            WHERE locale = 'fi' AND key = 'landing.scale_more_help';
UPDATE ui_translations SET value = 'Enemmän apua tarvitaan'        WHERE locale = 'fi' AND key = 'landing.scale_more_indep';
UPDATE ui_translations SET value = 'Täysin itsenäisestä täyteen apuun — selkeä kehys päivittäisten toimintojen havainnointiin'
  WHERE locale = 'fi' AND key = 'landing.scale_summary';
UPDATE ui_translations SET value = 'Enemmän itsenäinen'            WHERE locale = 'fi' AND key = 'scale.more_help';
UPDATE ui_translations SET value = 'Enemmän apua tarvitaan'        WHERE locale = 'fi' AND key = 'scale.more_independent';
