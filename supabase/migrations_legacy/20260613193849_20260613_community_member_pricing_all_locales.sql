/*
  # Community Member — Pricing card copy update, all 7 non-English locales

  Updates 6 pricing keys to match the June 13 English copy that rebranded
  "Community Observer" → "Community Member" and added the observations benefit.

  Keys updated:
    pricing.plan_free_name  — "Community Member"
    pricing.plan_free_desc  — updated description with observations mention
    pricing.plan_free_f1    — "Access all 6 caregiver support rooms"
    pricing.plan_free_f2    — "Post, reply, and react with other caregivers"
    pricing.plan_free_f3    — "Post anonymously when you need privacy"
    pricing.plan_free_f4    — "No invite required — join instantly" (new key, add 7 non-EN locales)
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES

  -- pricing.plan_free_name
  ('es', 'pricing.plan_free_name', 'Miembro Comunitario'),
  ('it', 'pricing.plan_free_name', 'Membro della Comunità'),
  ('fr', 'pricing.plan_free_name', 'Membre de la Communauté'),
  ('de', 'pricing.plan_free_name', 'Community-Mitglied'),
  ('sv', 'pricing.plan_free_name', 'Gemenskapsmedlem'),
  ('fi', 'pricing.plan_free_name', 'Yhteisön jäsen'),
  ('ja', 'pricing.plan_free_name', 'コミュニティメンバー'),

  -- pricing.plan_free_desc
  ('es', 'pricing.plan_free_desc', 'Conéctate con otros cuidadores en nuestro foro de apoyo y prueba 3 observaciones de cuidado gratuitas. Comparte experiencias, haz preguntas y encuentra apoyo — no se necesita equipo de cuidado. Siempre gratis.'),
  ('it', 'pricing.plan_free_desc', 'Connettiti con altri caregiver nel nostro forum di supporto tra pari e prova 3 osservazioni di cura gratuite. Condividi esperienze, fai domande e trova supporto — nessun team di cura necessario. Sempre gratuito.'),
  ('fr', 'pricing.plan_free_desc', 'Connectez-vous avec d''autres aidants dans notre forum d''entraide et essayez 3 observations de soins gratuites. Partagez vos expériences, posez des questions et trouvez du soutien — aucune équipe de soins n''est nécessaire. Toujours gratuit.'),
  ('de', 'pricing.plan_free_desc', 'Vernetzen Sie sich mit anderen Pflegenden in unserem Peer-Support-Forum und testen Sie 3 kostenlose Pflegebeobachtungen. Teilen Sie Erfahrungen, stellen Sie Fragen und finden Sie Unterstützung — kein Pflegeteam erforderlich. Immer kostenlos.'),
  ('sv', 'pricing.plan_free_desc', 'Anslut med andra vårdgivare i vårt stödforum och prova 3 gratis vårdsobservationer. Dela erfarenheter, ställ frågor och hitta stöd — inget vårdteam behövs. Alltid gratis.'),
  ('fi', 'pricing.plan_free_desc', 'Yhdistä muihin hoitajiin vertaistukifoorumillamme ja kokeile 3 ilmaista hoitohavaintoa. Jaa kokemuksia, esitä kysymyksiä ja löydä tukea — hoitotiimiä ei tarvita. Aina ilmainen.'),
  ('ja', 'pricing.plan_free_desc', 'ピアサポートフォーラムで他のケアギバーとつながり、3回の無料ケア観察をお試しください。経験を共有し、質問し、サポートを見つけましょう — ケアチーム不要。常に無料。'),

  -- pricing.plan_free_f1 — "Access all 6 caregiver support rooms"
  ('es', 'pricing.plan_free_f1', 'Accede a las 6 salas de apoyo para cuidadores'),
  ('it', 'pricing.plan_free_f1', 'Accedi a tutte le 6 stanze di supporto per caregiver'),
  ('fr', 'pricing.plan_free_f1', 'Accédez aux 6 salles de soutien pour aidants'),
  ('de', 'pricing.plan_free_f1', 'Zugang zu allen 6 Pflegenden-Supporträumen'),
  ('sv', 'pricing.plan_free_f1', 'Tillgång till alla 6 stödrum för vårdgivare'),
  ('fi', 'pricing.plan_free_f1', 'Pääsy kaikkiin 6 hoitajan tukihuoneeseen'),
  ('ja', 'pricing.plan_free_f1', 'すべての6つのケアギバーサポートルームにアクセス'),

  -- pricing.plan_free_f2 — "Post, reply, and react with other caregivers"
  ('es', 'pricing.plan_free_f2', 'Publica, responde y reacciona con otros cuidadores'),
  ('it', 'pricing.plan_free_f2', 'Pubblica, rispondi e reagisci con altri caregiver'),
  ('fr', 'pricing.plan_free_f2', 'Publiez, répondez et réagissez avec d''autres aidants'),
  ('de', 'pricing.plan_free_f2', 'Beiträge verfassen, antworten und reagieren mit anderen Pflegenden'),
  ('sv', 'pricing.plan_free_f2', 'Publicera, svara och reagera med andra vårdgivare'),
  ('fi', 'pricing.plan_free_f2', 'Julkaise, vastaa ja reagoi muiden hoitajien kanssa'),
  ('ja', 'pricing.plan_free_f2', '他のケアギバーと投稿、返信、リアクション'),

  -- pricing.plan_free_f3 — "Post anonymously when you need privacy"
  ('es', 'pricing.plan_free_f3', 'Publica de forma anónima cuando necesites privacidad'),
  ('it', 'pricing.plan_free_f3', 'Pubblica in modo anonimo quando hai bisogno di privacy'),
  ('fr', 'pricing.plan_free_f3', 'Publiez anonymement quand vous avez besoin de confidentialité'),
  ('de', 'pricing.plan_free_f3', 'Anonym posten, wenn Sie Privatsphäre benötigen'),
  ('sv', 'pricing.plan_free_f3', 'Publicera anonymt när du behöver integritet'),
  ('fi', 'pricing.plan_free_f3', 'Julkaise anonyymisti, kun tarvitset yksityisyyttä'),
  ('ja', 'pricing.plan_free_f3', 'プライバシーが必要なときは匿名で投稿'),

  -- pricing.plan_free_f4 — "No invite required — join instantly"
  ('es', 'pricing.plan_free_f4', 'Sin invitación necesaria — únete al instante'),
  ('it', 'pricing.plan_free_f4', 'Nessun invito richiesto — unisciti subito'),
  ('fr', 'pricing.plan_free_f4', 'Aucune invitation requise — rejoignez immédiatement'),
  ('de', 'pricing.plan_free_f4', 'Keine Einladung erforderlich — sofort beitreten'),
  ('sv', 'pricing.plan_free_f4', 'Ingen inbjudan krävs — gå med direkt'),
  ('fi', 'pricing.plan_free_f4', 'Ei kutsua tarvita — liity heti'),
  ('ja', 'pricing.plan_free_f4', '招待不要 — すぐに参加')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
