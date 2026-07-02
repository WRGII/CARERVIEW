
-- Update hero copy for all locales
-- English
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('en', 'common', 'why.hero_title',       'Caring for someone you love is hard enough.'),
  ('en', 'common', 'why.hero_title_line2', 'Doing it without a plan makes it harder.'),
  ('en', 'common', 'why.hero_body',        'Most family care teams form in a crisis — and stay in one. Information is scattered, responsibilities drift, and the load falls on whoever steps up first. CarerView gives your family a shared plan, organised information, and a common language: the foundation that lets you face whatever comes next together.'),
  ('en', 'common', 'why.challenge1_label', 'No shared plan'),
  ('en', 'common', 'why.challenge1_hint',  'Build one framework everyone can see'),
  ('en', 'common', 'why.challenge2_label', 'No common language'),
  ('en', 'common', 'why.challenge2_hint',  'Speak from the same definitions and data'),
  ('en', 'common', 'why.challenge3_label', 'No visibility into change'),
  ('en', 'common', 'why.challenge3_hint',  'Track what matters over time')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Spanish
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('es', 'common', 'why.hero_title',       'Cuidar a alguien que amas ya es difícil.'),
  ('es', 'common', 'why.hero_title_line2', 'Hacerlo sin un plan lo hace aún más difícil.'),
  ('es', 'common', 'why.hero_body',        'La mayoría de los equipos de cuidado familiar se forman en una crisis — y permanecen en ella. La información está dispersa, las responsabilidades se diluyen y la carga recae sobre quien da el primer paso. CarerView le da a tu familia un plan compartido, información organizada y un lenguaje común: la base que les permite enfrentar juntos lo que venga.'),
  ('es', 'common', 'why.challenge1_label', 'Sin plan compartido'),
  ('es', 'common', 'why.challenge1_hint',  'Crea un marco que todos puedan ver'),
  ('es', 'common', 'why.challenge2_label', 'Sin lenguaje común'),
  ('es', 'common', 'why.challenge2_hint',  'Habla desde las mismas definiciones y datos'),
  ('es', 'common', 'why.challenge3_label', 'Sin visibilidad del cambio'),
  ('es', 'common', 'why.challenge3_hint',  'Registra lo que importa con el tiempo')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- German
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('de', 'common', 'why.hero_title',       'Jemanden zu pflegen, den man liebt, ist schon schwer genug.'),
  ('de', 'common', 'why.hero_title_line2', 'Ohne Plan wird es noch schwerer.'),
  ('de', 'common', 'why.hero_body',        'Die meisten familiären Pflegeteams entstehen in einer Krise – und bleiben darin. Informationen sind verstreut, Verantwortlichkeiten verschwimmen, und die Last fällt auf denjenigen, der als Erster einspringt. CarerView gibt Ihrer Familie einen gemeinsamen Plan, organisierte Informationen und eine gemeinsame Sprache: das Fundament, das es Ihnen ermöglicht, gemeinsam zu begegnen, was auch immer kommt.'),
  ('de', 'common', 'why.challenge1_label', 'Kein gemeinsamer Plan'),
  ('de', 'common', 'why.challenge1_hint',  'Erstellen Sie ein Rahmenwerk, das alle sehen können'),
  ('de', 'common', 'why.challenge2_label', 'Keine gemeinsame Sprache'),
  ('de', 'common', 'why.challenge2_hint',  'Sprechen Sie aus denselben Definitionen und Daten'),
  ('de', 'common', 'why.challenge3_label', 'Keine Sichtbarkeit von Veränderungen'),
  ('de', 'common', 'why.challenge3_hint',  'Verfolgen Sie, was im Laufe der Zeit wichtig ist')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- French
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('fr', 'common', 'why.hero_title',       'S''occuper de quelqu''un que vous aimez est déjà difficile.'),
  ('fr', 'common', 'why.hero_title_line2', 'Le faire sans plan rend les choses encore plus dures.'),
  ('fr', 'common', 'why.hero_body',        'La plupart des équipes familiales de soins se forment dans une crise — et y restent. Les informations sont éparpillées, les responsabilités dérivent, et la charge repose sur celui qui s''implique en premier. CarerView donne à votre famille un plan partagé, des informations organisées et un langage commun : la base qui vous permet d''affronter ensemble ce qui vient.'),
  ('fr', 'common', 'why.challenge1_label', 'Pas de plan partagé'),
  ('fr', 'common', 'why.challenge1_hint',  'Créez un cadre que tout le monde peut voir'),
  ('fr', 'common', 'why.challenge2_label', 'Pas de langage commun'),
  ('fr', 'common', 'why.challenge2_hint',  'Parlez à partir des mêmes définitions et données'),
  ('fr', 'common', 'why.challenge3_label', 'Pas de visibilité sur le changement'),
  ('fr', 'common', 'why.challenge3_hint',  'Suivez ce qui compte dans le temps')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Italian
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('it', 'common', 'why.hero_title',       'Prendersi cura di qualcuno che ami è già abbastanza difficile.'),
  ('it', 'common', 'why.hero_title_line2', 'Farlo senza un piano lo rende ancora più difficile.'),
  ('it', 'common', 'why.hero_body',        'La maggior parte dei team familiari di cura si forma in una crisi — e ci rimane. Le informazioni sono sparse, le responsabilità sfumano e il peso ricade su chi si fa avanti per primo. CarerView offre alla tua famiglia un piano condiviso, informazioni organizzate e un linguaggio comune: la base che vi permette di affrontare insieme ciò che verrà.'),
  ('it', 'common', 'why.challenge1_label', 'Nessun piano condiviso'),
  ('it', 'common', 'why.challenge1_hint',  'Costruisci un quadro che tutti possano vedere'),
  ('it', 'common', 'why.challenge2_label', 'Nessun linguaggio comune'),
  ('it', 'common', 'why.challenge2_hint',  'Parla dalle stesse definizioni e dati'),
  ('it', 'common', 'why.challenge3_label', 'Nessuna visibilità sui cambiamenti'),
  ('it', 'common', 'why.challenge3_hint',  'Traccia ciò che conta nel tempo')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Swedish
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('sv', 'common', 'why.hero_title',       'Att ta hand om någon du älskar är svårt nog.'),
  ('sv', 'common', 'why.hero_title_line2', 'Att göra det utan en plan gör det ännu svårare.'),
  ('sv', 'common', 'why.hero_body',        'De flesta familjers vårdteam bildas i en kris — och stannar i den. Information är spridd, ansvar försvinner och bördan faller på den som tar initiativet. CarerView ger din familj en gemensam plan, organiserad information och ett gemensamt språk: grunden som låter er möta det som kommer, tillsammans.'),
  ('sv', 'common', 'why.challenge1_label', 'Ingen gemensam plan'),
  ('sv', 'common', 'why.challenge1_hint',  'Bygg ett ramverk alla kan se'),
  ('sv', 'common', 'why.challenge2_label', 'Inget gemensamt språk'),
  ('sv', 'common', 'why.challenge2_hint',  'Tala utifrån samma definitioner och data'),
  ('sv', 'common', 'why.challenge3_label', 'Ingen synlighet i förändringar'),
  ('sv', 'common', 'why.challenge3_hint',  'Spåra det som är viktigt över tid')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Finnish
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('fi', 'common', 'why.hero_title',       'Rakastamasi ihmisen hoitaminen on jo tarpeeksi vaikeaa.'),
  ('fi', 'common', 'why.hero_title_line2', 'Ilman suunnitelmaa se on vieläkin vaikeampaa.'),
  ('fi', 'common', 'why.hero_body',        'Useimmat perhehoitotiimit syntyvät kriisin keskellä — ja pysyvät siinä. Tieto on hajallaan, vastuut hämärtyvät ja taakka lankeaa sille, joka astuu ensin esiin. CarerView antaa perheellesi yhteisen suunnitelman, järjestetyn tiedon ja yhteisen kielen: perustan, jonka varassa voitte kohdata tulevat haasteet yhdessä.'),
  ('fi', 'common', 'why.challenge1_label', 'Ei yhteistä suunnitelmaa'),
  ('fi', 'common', 'why.challenge1_hint',  'Luo kehys, jonka kaikki voivat nähdä'),
  ('fi', 'common', 'why.challenge2_label', 'Ei yhteistä kieltä'),
  ('fi', 'common', 'why.challenge2_hint',  'Puhu samoista määritelmistä ja tiedoista'),
  ('fi', 'common', 'why.challenge3_label', 'Ei näkyvyyttä muutoksiin'),
  ('fi', 'common', 'why.challenge3_hint',  'Seuraa tärkeää ajan kuluessa')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Japanese
INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  ('ja', 'common', 'why.hero_title',       '愛する人を介護するのは、それだけで十分に大変なことです。'),
  ('ja', 'common', 'why.hero_title_line2', '計画なしではさらに困難になります。'),
  ('ja', 'common', 'why.hero_body',        'ほとんどの家族ケアチームは危機の中で生まれ、その状態が続きます。情報は分散し、責任は曖昧になり、最初に動いた人に負担が集中します。CarerViewは、共有されたプラン、整理された情報、共通の言語を家族に提供します。それが、これから何が起きても一緒に向き合うための基盤となります。'),
  ('ja', 'common', 'why.challenge1_label', '共有プランがない'),
  ('ja', 'common', 'why.challenge1_hint',  '全員が見られる共通の枠組みを作る'),
  ('ja', 'common', 'why.challenge2_label', '共通言語がない'),
  ('ja', 'common', 'why.challenge2_hint',  '同じ定義とデータから話す'),
  ('ja', 'common', 'why.challenge3_label', '変化の可視性がない'),
  ('ja', 'common', 'why.challenge3_hint',  '時間をかけて重要なことを追跡する')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;
