/*
  # Policy Pages: GDPR Content Translations — Spanish, Italian, French

  Adds complete translated body text for both policy pages in es, it, fr locales.
  Uses INSERT ... ON CONFLICT DO NOTHING for idempotency.
*/

INSERT INTO ui_translations (locale, key, value) VALUES

-- ============================================================
-- SPANISH (es)
-- ============================================================
  ('es', 'policy.priv_notice',
   'Esta Política de Privacidad explica cómo CarerView (operado por GrifDigi Ltd) recopila, usa, almacena y protege sus datos personales cuando utiliza nuestro servicio. Se emite de conformidad con el Reglamento General de Protección de Datos del Reino Unido (UK GDPR) y la Ley de Protección de Datos de 2018. GrifDigi Ltd actúa como responsable del tratamiento de los datos personales que usted nos proporciona. Si tiene alguna pregunta sobre esta política, póngase en contacto con nosotros en CarerView@GrifDigi.com.'),

  ('es', 'policy.priv_s1_body',
   'Recopilamos las siguientes categorías de datos personales: (a) Datos de cuenta — su nombre, dirección de correo electrónico y contraseña al registrarse; (b) Datos de observación de cuidados — observaciones estructuradas, notas, puntuaciones y evaluaciones que introduce sobre la persona a su cargo; (c) Datos de equipo y perfil — información sobre cuidadores y receptores de cuidados asociados a su cuenta; (d) Datos de uso y técnicos — dirección IP, tipo de navegador, identificadores de dispositivo y datos de registro recopilados automáticamente. Nuestras bases legales son: ejecución de un contrato; intereses legítimos; y, cuando se introducen datos de salud, su consentimiento explícito conforme al Artículo 9 UK GDPR.'),

  ('es', 'policy.priv_s2_body',
   'Utilizamos sus datos personales para: (a) crear y gestionar su cuenta y autenticar su identidad; (b) prestar el servicio CarerView; (c) enviar comunicaciones transaccionales como confirmaciones de cuenta, restablecimientos de contraseña y notificaciones de suscripción; (d) procesar pagos de forma segura a través de Stripe; (e) supervisar y mejorar el rendimiento del servicio; (f) cumplir con nuestras obligaciones legales. No utilizamos sus datos para toma de decisiones automatizada con efectos jurídicos significativos.'),

  ('es', 'policy.priv_s3_body',
   'Sus datos se almacenan en infraestructura proporcionada por Supabase, Inc., alojada en centros de datos de Amazon Web Services (AWS) ubicados en el Espacio Económico Europeo y el Reino Unido. Todos los datos se cifran en tránsito con TLS 1.2 o superior y en reposo con AES-256. El acceso a los datos personales está restringido a personal autorizado. En caso de una violación de datos personales que sea probable que suponga un riesgo para sus derechos y libertades, notificaremos a la autoridad supervisora competente en un plazo de 72 horas y le informaremos sin demora indebida cuando así lo exija la ley.'),

  ('es', 'policy.priv_s4_body',
   'En virtud del UK GDPR, usted tiene los siguientes derechos: (a) Derecho de acceso; (b) Derecho de rectificación; (c) Derecho de supresión; (d) Derecho a la limitación del tratamiento; (e) Derecho a la portabilidad de los datos; (f) Derecho de oposición; (g) Derechos relacionados con la toma de decisiones automatizada. Para ejercer cualquiera de estos derechos, contacte con nosotros en CarerView@GrifDigi.com. También tiene derecho a presentar una reclamación ante la autoridad de protección de datos competente.'),

  ('es', 'policy.priv_s5_title', 'Cookies'),

  ('es', 'policy.priv_s5_body',
   'CarerView no utiliza cookies de seguimiento, publicidad ni analíticas. No colocamos ninguna cookie de terceros en su dispositivo. Es posible que nuestro servicio de autenticación establezca cookies de sesión estrictamente necesarias únicamente para mantener su sesión activa; estas se eliminan al cerrar el navegador o cerrar sesión. Ningún dato personal se transmite a terceros a través de cookies.'),

  ('es', 'policy.data_notice',
   'Esta Política de Datos explica cómo CarerView gestiona los datos de cuidado que introduce en la aplicación. Usted conserva la propiedad de estos datos en todo momento. CarerView actúa como encargado del tratamiento en su nombre y nunca usará sus datos de cuidado para ningún otro propósito que no sea la prestación del servicio. Esta política debe leerse junto con nuestra Política de Privacidad.'),

  ('es', 'policy.data_s1_body',
   'Los datos de cuidado que crea en CarerView — incluidas observaciones diarias, puntuaciones de actividad, notas y cualquier información personal o médica que elija registrar sobre el receptor de cuidados — son suyos. Usted es el responsable del tratamiento de este contenido; CarerView lo procesa únicamente siguiendo sus instrucciones. Donde los datos de cuidado se relacionen con la salud o discapacidad, se tratan como datos de categoría especial y se protegen con salvaguardas técnicas y controles de acceso adicionales.'),

  ('es', 'policy.data_s2_body',
   'CarerView nunca venderá, alquilará ni cederá sus datos de cuidado a terceros. No compartiremos sus datos de cuidado con ninguna organización externa excepto: (a) con subencargados estrictamente necesarios para la prestación del servicio, bajo acuerdos vinculantes de tratamiento de datos; (b) donde usted haya concedido acceso explícitamente a otros miembros del equipo; o (c) donde estemos legalmente obligados a hacerlo. Podemos utilizar datos estadísticos completamente anonimizados y agregados únicamente para la mejora interna del servicio.'),

  ('es', 'policy.data_s3_body',
   'Sus datos de cuidado se conservan mientras su cuenta de CarerView esté activa. Si elimina su cuenta, suprimiremos permanentemente todos los datos de cuidado asociados en un plazo de 30 días desde el cierre de la cuenta, salvo que estemos legalmente obligados a conservar ciertos registros durante más tiempo. Las copias de seguridad se eliminan en un ciclo continuo de 30 días.'),

  ('es', 'policy.data_s4_body',
   'Tiene derecho a una copia completa y portátil de todos los datos de cuidado introducidos en CarerView. Puede generar y descargar una exportación completa en cualquier momento desde la configuración de la cuenta en formato DOCX. No hay límite de frecuencia ni se cobra tarifa alguna. Si necesita asistencia, contacte con CarerView@GrifDigi.com.'),

  ('es', 'policy.data_s5_body',
   'CarerView es una herramienta de observación y registro de cuidados. No es un producto sanitario registrado, un sistema de apoyo a decisiones clínicas ni un instrumento de diagnóstico. La información registrada en CarerView refleja observaciones realizadas por cuidadores y no debe interpretarse como evaluaciones clínicas ni diagnósticos médicos. Nada en CarerView constituye asesoramiento médico. Consulte siempre a un profesional sanitario cualificado.'),

-- ============================================================
-- ITALIAN (it)
-- ============================================================
  ('it', 'policy.priv_notice',
   'La presente Informativa sulla Privacy spiega come CarerView (gestito da GrifDigi Ltd) raccoglie, utilizza, archivia e protegge i Suoi dati personali durante l''utilizzo del servizio. È emessa in conformità con il Regolamento Generale sulla Protezione dei Dati del Regno Unito (UK GDPR) e il Data Protection Act 2018. GrifDigi Ltd agisce come titolare del trattamento dei dati personali da Lei forniti. Per qualsiasi domanda, contatti CarerView@GrifDigi.com.'),

  ('it', 'policy.priv_s1_body',
   'Raccogliamo le seguenti categorie di dati personali: (a) Dati account — nome, indirizzo e-mail e password alla registrazione; (b) Dati di osservazione delle cure — osservazioni strutturate, note, punteggi e valutazioni inseriti sulla persona assistita; (c) Dati di team e profilo — informazioni su caregiver e destinatari di cure associati all''account; (d) Dati tecnici e di utilizzo — indirizzo IP, tipo di browser, identificatori dispositivo e dati di log raccolti automaticamente. Le basi giuridiche sono: esecuzione di un contratto; interessi legittimi; e, dove vengono inseriti dati sanitari, il Suo consenso esplicito ai sensi dell''Articolo 9 UK GDPR.'),

  ('it', 'policy.priv_s2_body',
   'Utilizziamo i Suoi dati personali per: (a) creare e gestire il Suo account e autenticarne l''identità; (b) erogare il servizio CarerView; (c) inviare comunicazioni transazionali come conferme account, reimpostazione password e notifiche di abbonamento; (d) elaborare i pagamenti in modo sicuro tramite Stripe; (e) monitorare e migliorare le prestazioni del servizio; (f) adempiere ai nostri obblighi legali. Non utilizziamo i Suoi dati per processi decisionali automatizzati con effetti giuridici significativi.'),

  ('it', 'policy.priv_s3_body',
   'I Suoi dati sono archiviati su infrastruttura fornita da Supabase, Inc., ospitata su data center Amazon Web Services (AWS) situati nello Spazio Economico Europeo e nel Regno Unito. Tutti i dati sono cifrati in transito con TLS 1.2 o superiore e a riposo con AES-256. In caso di violazione dei dati personali che probabilmente comporti un rischio per i Suoi diritti e libertà, notificheremo all''autorità di controllo competente entro 72 ore e La informeremo senza ingiustificato ritardo ove richiesto dalla legge.'),

  ('it', 'policy.priv_s4_body',
   'Ai sensi dell''UK GDPR, Lei ha i seguenti diritti: (a) Diritto di accesso; (b) Diritto di rettifica; (c) Diritto alla cancellazione; (d) Diritto alla limitazione del trattamento; (e) Diritto alla portabilità dei dati; (f) Diritto di opposizione; (g) Diritti relativi alla profilazione automatizzata. Per esercitare questi diritti, contatti CarerView@GrifDigi.com. Ha inoltre il diritto di proporre reclamo all''autorità di controllo competente.'),

  ('it', 'policy.priv_s5_title', 'Cookie'),

  ('it', 'policy.priv_s5_body',
   'CarerView non utilizza cookie di tracciamento, pubblicitari o analitici. Non installiamo cookie di terze parti sul Suo dispositivo. Il nostro servizio di autenticazione può impostare cookie di sessione strettamente necessari unicamente per mantenere attiva la Sua sessione; vengono eliminati alla chiusura del browser o al logout. Nessun dato personale viene trasmesso a terze parti tramite cookie.'),

  ('it', 'policy.data_notice',
   'La presente Informativa sui Dati spiega come CarerView gestisce i dati di cura inseriti nell''applicazione. Lei conserva la proprietà di questi dati in ogni momento. CarerView agisce come responsabile del trattamento per Suo conto e non utilizzerà mai i Suoi dati di cura per scopi diversi dalla fornitura del servizio. Questa informativa deve essere letta insieme alla nostra Informativa sulla Privacy.'),

  ('it', 'policy.data_s1_body',
   'I dati di cura che crea in CarerView — incluse osservazioni quotidiane, punteggi di attività, note e qualsiasi informazione personale o medica che sceglie di registrare — sono Suoi. Lei è il titolare del trattamento di questo contenuto; CarerView lo elabora unicamente su Sua istruzione. Dove i dati di cura riguardano la salute o la disabilità, sono trattati come dati di categoria speciale con ulteriori salvaguardie tecniche.'),

  ('it', 'policy.data_s2_body',
   'CarerView non venderà, affitterà né cederà mai i Suoi dati di cura a terzi. Non condivideremo i Suoi dati di cura con organizzazioni esterne eccetto: (a) con sub-responsabili strettamente necessari per l''erogazione del servizio, sotto accordi vincolanti; (b) dove Lei abbia concesso accesso esplicito ad altri membri del team; o (c) dove siamo legalmente obbligati. Possiamo utilizzare dati statistici completamente anonimi e aggregati esclusivamente per il miglioramento interno del servizio.'),

  ('it', 'policy.data_s3_body',
   'I Suoi dati di cura sono conservati per tutta la durata attiva del Suo account CarerView. In caso di eliminazione dell''account, cancelleremo permanentemente tutti i dati di cura associati entro 30 giorni dalla chiusura, salvo obblighi legali di conservazione. I backup vengono eliminati con un ciclo continuativo di 30 giorni.'),

  ('it', 'policy.data_s4_body',
   'Ha diritto a una copia completa e portabile di tutti i dati di cura inseriti in CarerView. Può generare e scaricare un''esportazione completa in qualsiasi momento dalla sezione impostazioni account in formato DOCX. Non sono previsti limiti di frequenza né costi. Per assistenza, contatti CarerView@GrifDigi.com.'),

  ('it', 'policy.data_s5_body',
   'CarerView è uno strumento di osservazione e registrazione delle cure. Non è un dispositivo medico registrato, un sistema di supporto alle decisioni cliniche né uno strumento diagnostico. Le informazioni registrate in CarerView riflettono osservazioni dei caregiver e non devono essere interpretate come valutazioni cliniche o diagnosi mediche. Nulla in CarerView costituisce consulenza medica. Consultare sempre un professionista sanitario qualificato.'),

-- ============================================================
-- FRENCH (fr)
-- ============================================================
  ('fr', 'policy.priv_notice',
   'La présente Politique de Confidentialité explique comment CarerView (exploité par GrifDigi Ltd) collecte, utilise, stocke et protège vos données personnelles lors de l''utilisation de notre service. Elle est publiée conformément au Règlement Général sur la Protection des Données du Royaume-Uni (UK GDPR) et au Data Protection Act 2018. GrifDigi Ltd agit en tant que responsable du traitement des données personnelles que vous nous fournissez. Pour toute question, contactez-nous à CarerView@GrifDigi.com.'),

  ('fr', 'policy.priv_s1_body',
   'Nous collectons les catégories suivantes de données personnelles : (a) Données de compte — votre nom, adresse e-mail et mot de passe lors de l''inscription ; (b) Données d''observation des soins — observations structurées, notes, scores et évaluations saisis sur la personne à votre charge ; (c) Données d''équipe et de profil — informations sur les aidants et bénéficiaires de soins associés à votre compte ; (d) Données d''utilisation et techniques — adresse IP, type de navigateur, identifiants d''appareil et données de journaux collectés automatiquement. Nos bases juridiques sont : l''exécution d''un contrat ; nos intérêts légitimes ; et, lorsque des données de santé sont saisies, votre consentement explicite au titre de l''Article 9 UK GDPR.'),

  ('fr', 'policy.priv_s2_body',
   'Nous utilisons vos données personnelles pour : (a) créer et gérer votre compte et authentifier votre identité ; (b) fournir le service CarerView ; (c) envoyer des communications transactionnelles telles que confirmations de compte, réinitialisations de mot de passe et notifications d''abonnement ; (d) traiter les paiements de manière sécurisée via Stripe ; (e) surveiller et améliorer les performances du service ; (f) respecter nos obligations légales. Nous n''utilisons pas vos données pour une prise de décision automatisée produisant des effets juridiques significatifs.'),

  ('fr', 'policy.priv_s3_body',
   'Vos données sont stockées sur l''infrastructure fournie par Supabase, Inc., hébergée sur des centres de données Amazon Web Services (AWS) situés dans l''Espace Économique Européen et au Royaume-Uni. Toutes les données sont chiffrées en transit avec TLS 1.2 ou supérieur et au repos avec AES-256. En cas de violation de données personnelles susceptible d''engendrer un risque pour vos droits et libertés, nous notifierons l''autorité de contrôle compétente dans les 72 heures et vous en informerons sans délai injustifié lorsque la loi l''exige.'),

  ('fr', 'policy.priv_s4_body',
   'En vertu du UK GDPR, vous disposez des droits suivants : (a) Droit d''accès ; (b) Droit de rectification ; (c) Droit à l''effacement ; (d) Droit à la limitation du traitement ; (e) Droit à la portabilité des données ; (f) Droit d''opposition ; (g) Droits relatifs à la prise de décision automatisée. Pour exercer l''un de ces droits, contactez-nous à CarerView@GrifDigi.com. Vous avez également le droit d''introduire une réclamation auprès de l''autorité de protection des données compétente.'),

  ('fr', 'policy.priv_s5_title', 'Cookies'),

  ('fr', 'policy.priv_s5_body',
   'CarerView n''utilise pas de cookies de suivi, publicitaires ou analytiques. Nous ne déposons aucun cookie tiers sur votre appareil. Notre service d''authentification peut placer des cookies de session strictement nécessaires uniquement pour maintenir votre session active ; ceux-ci sont supprimés à la fermeture du navigateur ou lors de la déconnexion. Aucune donnée personnelle n''est transmise à des tiers par le biais de cookies.'),

  ('fr', 'policy.data_notice',
   'La présente Politique de Données explique comment CarerView gère les données de soins que vous saisissez dans l''application. Vous conservez la propriété de ces données à tout moment. CarerView agit en tant que sous-traitant en votre nom et n''utilisera jamais vos données de soins à d''autres fins que la fourniture du service. Cette politique doit être lue conjointement avec notre Politique de Confidentialité.'),

  ('fr', 'policy.data_s1_body',
   'Les données de soins que vous créez dans CarerView — y compris les observations quotidiennes, scores d''activité, notes et toute information personnelle ou médicale que vous choisissez d''enregistrer — vous appartiennent. Vous êtes le responsable du traitement de ce contenu ; CarerView le traite uniquement sur vos instructions. Lorsque les données de soins concernent la santé ou le handicap, elles sont traitées comme des données de catégorie spéciale avec des garanties techniques supplémentaires.'),

  ('fr', 'policy.data_s2_body',
   'CarerView ne vendra, ne louera ni ne cèdera jamais vos données de soins à des tiers. Nous ne partagerons pas vos données de soins avec des organisations externes sauf : (a) avec des sous-traitants strictement nécessaires à la fourniture du service, sous accords contraignants ; (b) lorsque vous avez explicitement accordé l''accès à d''autres membres de l''équipe ; ou (c) lorsque nous y sommes légalement contraints. Nous pouvons utiliser des données statistiques entièrement anonymisées et agrégées uniquement pour l''amélioration interne du service.'),

  ('fr', 'policy.data_s3_body',
   'Vos données de soins sont conservées pendant toute la durée active de votre compte CarerView. Si vous supprimez votre compte, nous effacerons définitivement toutes les données de soins associées dans les 30 jours suivant la clôture du compte, sauf obligation légale de conservation. Les sauvegardes sont purgées sur un cycle continu de 30 jours.'),

  ('fr', 'policy.data_s4_body',
   'Vous avez droit à une copie complète et portable de toutes les données de soins saisies dans CarerView. Vous pouvez générer et télécharger une exportation complète à tout moment depuis les paramètres de compte au format DOCX. Il n''y a aucune limite de fréquence ni de frais. Pour toute assistance, contactez CarerView@GrifDigi.com.'),

  ('fr', 'policy.data_s5_body',
   'CarerView est un outil d''observation et de tenue de dossiers de soins. Il ne s''agit pas d''un dispositif médical enregistré, d''un système d''aide à la décision clinique ni d''un instrument de diagnostic. Les informations enregistrées dans CarerView reflètent des observations réalisées par des aidants et ne doivent pas être interprétées comme des évaluations cliniques ou des diagnostics médicaux. Rien dans CarerView ne constitue un conseil médical. Consultez toujours un professionnel de santé qualifié.')

ON CONFLICT (locale, key) DO NOTHING;
