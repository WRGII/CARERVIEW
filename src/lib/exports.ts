// src/lib/exports.ts
import { saveAs } from 'file-saver'

// ---------- Types aligned to runtime shapes (null-safe on joins) -------------
interface Legend {
  id: string
  score: number
  description: string
  created_at: string
}

interface Category {
  id: string
  name: string
  type: 'ADL' | 'IADL' | string
  ada_definition?: string
  ot_definition?: string
  sort_order?: number
  created_at?: string
}

interface Question {
  id: string
  category_id: string
  question_text: string
  sort_order: number
  created_at?: string
}

interface CategoryWithQuestions extends Category {
  questions: Question[]
}

type FormType = 'ADL' | 'IADL' | 'COMPREHENSIVE' | null | undefined

interface ObservationWithResponses {
  id: string
  user_id: string
  resident_name: string | null
  observation_date: string // YYYY-MM-DD
  date_of_observation?: string | null
  mode_of_observation?: 'In Person' | 'Voice Call' | 'Video Call'
  notes: string | null
  caregiver_name: string | null
  caregiver_email: string | null
  created_at: string
  updated_at: string
  form_type?: FormType
  responses: Array<{
    id: string
    observation_id: string
    question_id: string
    score: number
    notes: string | null
    category_notes?: string | null
    created_at: string
    updated_at: string
    question?: {
      id: string
      question_text: string
      sort_order: number
      category?: {
        id: string
        name: string
        type: 'ADL' | 'IADL'
      } | null
    } | null
  }>
}

type TFn = (key: string, vars?: Record<string, string | number>) => string

// ---------- Helpers ----------------------------------------------------------
const formTypeLabel = (t: TFn, type: FormType) => {
  if (type === 'COMPREHENSIVE') return t('obs_form.comp_label')
  return type || '—'
}

const colorForScore = (score: number) => {
  if (score <= 2) return '059669'
  if (score <= 3) return '0ea5e9'
  return 'dc2626'
}

const safeFile = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '_')

// ---------- DOCX -------------------------------------------------------------
export const exportToDOCX = async (
  observation: ObservationWithResponses,
  categories: CategoryWithQuestions[],
  legend: Legend[],
  t: TFn,
  intlLocale = 'en-US'
) => {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
  } = await import('docx')

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: t('export.report_title'),
                bold: true,
                size: 32,
                color: '2563eb',
              }),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: t('export.report_disclaimer'),
                size: 20,
                italics: true,
                color: '6b7280',
              }),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [new TextRun({ text: t('export.person_observed'), bold: true, size: 28, underline: {} })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${t('export.field_name')}: ${observation.resident_name || t('export.not_specified')}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${t('export.field_obs_date')}: ${new Date(observation.observation_date).toLocaleDateString(intlLocale)}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${t('export.field_obs_type')}: ${formTypeLabel(t, observation.form_type)}`,
                size: 24,
              }),
            ],
          }),
          ...(observation.mode_of_observation
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${t('export.field_mode')}: ${observation.mode_of_observation}`,
                      size: 24,
                    }),
                  ],
                }),
              ]
            : []),
          new Paragraph({
            children: [
              new TextRun({
                text: `${t('export.field_generated')}: ${new Date().toLocaleDateString(intlLocale)} ${new Date().toLocaleTimeString(intlLocale)}`,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),

          ...(observation.caregiver_name
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${t('export.field_observed_by')}: ${observation.caregiver_name}`,
                      size: 24,
                    }),
                  ],
                }),
              ]
            : []),

          ...(observation.notes
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: t('export.caregiver_notes'),
                      bold: true,
                      size: 28,
                      underline: {},
                    }),
                  ],
                  spacing: { before: 400, after: 200 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: observation.notes, size: 24 })],
                  spacing: { after: 400 },
                }),
              ]
            : []),

          new Paragraph({
            children: [
              new TextRun({ text: t('export.assessment_results'), bold: true, size: 28, underline: {} }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          ...categories.flatMap((category) => {
            const categoryResponses = (observation.responses || []).filter(
              (r) => r.question?.category?.id === category.id
            )
            if (categoryResponses.length === 0) return []

            const categoryNotes =
              categoryResponses.length > 0 ? categoryResponses[0].category_notes : null

            return [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${category.name} (${category.type ?? 'ADL'})`,
                    bold: true,
                    size: 26,
                    color: '1f2937',
                  }),
                ],
                spacing: { before: 300, after: 200 },
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: t('export.col_question'), bold: true, size: 22 })],
                          }),
                        ],
                        width: { size: 60, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: t('export.col_score'), bold: true, size: 22 })],
                          }),
                        ],
                        width: { size: 15, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: t('export.col_description'), bold: true, size: 22 })],
                          }),
                        ],
                        width: { size: 25, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  }),
                  ...categoryResponses.map((response) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text:
                                    response.question?.question_text ||
                                    t('export.question_unavailable'),
                                  size: 20,
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: `${response.score}/5`,
                                  bold: true,
                                  size: 20,
                                  color: colorForScore(response.score),
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text:
                                    legend.find((l) => l.score === response.score)?.description ||
                                    '',
                                  size: 20,
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    })
                  ),
                ],
              }),

              ...(categoryNotes
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${category.name} ${t('export.category_notes_suffix')}`,
                          bold: true,
                          size: 22,
                          color: '374151',
                        }),
                      ],
                      spacing: { before: 200, after: 100 },
                    }),
                    new Paragraph({
                      children: [new TextRun({ text: categoryNotes, size: 20, color: '4b5563' })],
                      spacing: { after: 200 },
                    }),
                  ]
                : []),

              new Paragraph({ text: '', spacing: { after: 200 } }),
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: t('export.adl_scale_title'),
                bold: true,
                size: 32,
                color: '1f2937',
              }),
            ],
            spacing: { before: 600, after: 200 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: t('export.adl_scale_desc'),
                size: 20,
                color: '374151',
              }),
            ],
            spacing: { after: 300 },
          }),

          new Paragraph({
            children: [new TextRun({ text: t('export.scoring_legend'), bold: true, size: 28, underline: {} })],
            spacing: { before: 100, after: 200 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: t('export.col_score'), bold: true, size: 22 })],
                      }),
                    ],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: t('export.col_description'), bold: true, size: 22 })],
                      }),
                    ],
                    width: { size: 80, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              ...legend
                .slice()
                .sort((a, b) => a.score - b.score)
                .map((item) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: item.score.toString(),
                                bold: true,
                                size: 20,
                                color: colorForScore(item.score),
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: item.description, size: 20 })],
                          }),
                        ],
                      }),
                    ],
                  })
                ),
            ],
          }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  const fileName = `observation-${safeFile(observation.resident_name || 'unnamed')}-${
    observation.observation_date
  }.docx`
  saveAs(blob, fileName)
}

// ---------- CSV --------------------------------------------------------------
export const exportToCSV = async (
  observation: ObservationWithResponses,
  categories: CategoryWithQuestions[],
  legend: Legend[],
  t: TFn,
  intlLocale = 'en-US'
) => {
  const escapeCSV = (value: unknown): string => {
    let s = (value ?? '').toString()
    if (/^[=+\-@|%]/.test(s)) {
      s = `\t${s}`
    }
    return s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\t')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const headers = [
    t('export.csv_resident_name'),
    t('export.csv_obs_date'),
    t('export.csv_obs_type'),
    t('export.csv_mode'),
    t('export.csv_category'),
    t('export.csv_category_type'),
    t('export.csv_question'),
    t('export.csv_score'),
    t('export.csv_score_desc'),
    t('export.csv_question_notes'),
    t('export.csv_category_notes'),
  ]

  const rows: string[][] = []

  ;(observation.responses || []).forEach((response) => {
    const category = response.question?.category
    const legendDescription = legend.find((l) => l.score === response.score)?.description || ''
    rows.push([
      observation.resident_name || t('export.unnamed_resident'),
      observation.observation_date,
      formTypeLabel(t, observation.form_type),
      observation.mode_of_observation || '',
      category?.name || '',
      category?.type || '',
      response.question?.question_text || '',
      response.score?.toString() || '',
      legendDescription,
      response.notes || '',
      response.category_notes || '',
    ])
  })

  if (rows.length === 0) {
    rows.push([
      observation.resident_name || t('export.unnamed_resident'),
      observation.observation_date,
      formTypeLabel(t, observation.form_type),
      observation.mode_of_observation || '',
      '',
      '',
      t('export.no_responses'),
      '',
      '',
      '',
      observation.notes || '',
    ])
  }

  const csvContent = [
    [t('export.report_title')],
    [t('export.csv_generated'), new Date().toLocaleString(intlLocale)],
    [t('export.csv_person_observed'), observation.resident_name || t('export.not_specified')],
    [t('export.csv_observed_by'), observation.caregiver_name || ''],
    [''],
    [t('export.csv_caregiver_notes'), observation.notes || t('export.csv_none')],
    [''],
    headers,
    ...rows,
    [''],
    [t('export.scoring_legend')],
    [t('export.col_score'), t('export.col_description')],
    ...legend
      .slice()
      .sort((a, b) => a.score - b.score)
      .map((item) => [item.score.toString(), item.description]),
  ]
    .map((row) => row.map(escapeCSV).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const fileName = `observation-${safeFile(observation.resident_name || 'unnamed')}-${
    observation.observation_date
  }.csv`
  saveAs(blob, fileName)
}
