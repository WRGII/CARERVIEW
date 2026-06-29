/*
  # Seed admin namespace translation keys
*/

INSERT INTO public.ui_translations (key, locale, value) VALUES
  ('admin.active_caregivers',      'en', 'Active Caregivers'),
  ('admin.total_obs',              'en', 'Total Observations'),
  ('admin.avg_score',              'en', 'Avg Category Score'),
  ('admin.this_week',              'en', 'This Week'),
  ('admin.avg_scores_by_category', 'en', 'Average Scores by Category'),
  ('admin.loading_aggregate',      'en', 'Loading aggregate data…'),
  ('admin.error_aggregate',        'en', 'Failed to load aggregate data'),
  ('admin.no_data',                'en', 'No data available'),
  ('admin.loading_editor',         'en', 'Loading translations editor…'),
  ('admin.auth_required',          'en', 'Authentication required.'),
  ('admin.profile_required',       'en', 'Profile not found.'),
  ('admin.active_caregivers',      'es', 'Cuidadores activos'),
  ('admin.total_obs',              'es', 'Observaciones totales'),
  ('admin.avg_score',              'es', 'Puntuación media por categoría'),
  ('admin.this_week',              'es', 'Esta semana'),
  ('admin.avg_scores_by_category', 'es', 'Puntuaciones medias por categoría'),
  ('admin.loading_aggregate',      'es', 'Cargando datos agregados…'),
  ('admin.error_aggregate',        'es', 'Error al cargar los datos agregados'),
  ('admin.no_data',                'es', 'No hay datos disponibles'),
  ('admin.loading_editor',         'es', 'Cargando editor de traducciones…'),
  ('admin.auth_required',          'es', 'Se requiere autenticación.'),
  ('admin.profile_required',       'es', 'Perfil no encontrado.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();