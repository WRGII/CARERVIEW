/*
  # Update Footer Tagline — All Locales

  Replaces the verbose clinical-framework tagline with the new shorter,
  warmer line: "Built by carers, for carers. Helping your family navigate
  the caregiving journey." — adapted naturally for each locale.
*/

UPDATE ui_translations SET value = 'Built by carers, for carers. Helping your family navigate the caregiving journey.'
  WHERE key = 'footer.tagline' AND locale = 'en';

UPDATE ui_translations SET value = 'Creado por cuidadores, para cuidadores. Ayudando a tu familia a navegar el camino del cuidado.'
  WHERE key = 'footer.tagline' AND locale = 'es';

UPDATE ui_translations SET value = 'Costruito da caregiver, per caregiver. Aiutiamo la tua famiglia nel percorso dell''assistenza.'
  WHERE key = 'footer.tagline' AND locale = 'it';

UPDATE ui_translations SET value = 'Conçu par des aidants, pour des aidants. Nous aidons votre famille à traverser le parcours de l''aidance.'
  WHERE key = 'footer.tagline' AND locale = 'fr';

UPDATE ui_translations SET value = 'Von Pflegenden für Pflegende. Wir helfen Ihrer Familie, den Pflegeweg gemeinsam zu gehen.'
  WHERE key = 'footer.tagline' AND locale = 'de';

UPDATE ui_translations SET value = 'Byggt av vårdare, för vårdare. Vi hjälper din familj att navigera omsorgsresan.'
  WHERE key = 'footer.tagline' AND locale = 'sv';

UPDATE ui_translations SET value = 'Hoitajien rakentama, hoitajille. Autamme perhettäsi kulkemaan hoivapolulla.'
  WHERE key = 'footer.tagline' AND locale = 'fi';
