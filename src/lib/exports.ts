// src/lib/exports.ts
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

// Types aligned to your runtime shapes and tolerant to missing joins
interface Legend {
  id: string
  score: number
  description: string
  created_at: string
}

interface Category {
  id: string
  name: string
  type: 'ADL' | 'IADL'
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

interface ObservationWithResponses {
  id: string
  user_id: string
  patient_name: string | null
  observation_date: string // YYYY-MM-DD
  date_of_observation?: string | null
  mode_of_observation?: 'In Person' | 'Voice Call' | 'Video Call'
  notes: string | null
  caregiver_name: string | null
  caregiver_email: string | null
  created_at: string
  updated_at: string
  // Each response may or may not have the joined question/category (RLS, etc.)
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

export const exportToDOCX = async (
  observation: ObservationWithResponses,
  categories: CategoryWithQuestions[],
  legend: Legend[]
) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header
        new Paragraph({
          children: [
            new TextRun({
              text: 'CarerView Observation Report',
              bold: true,
              size: 32,
              color: '2563eb'
            })
          ],
          spacing: { after: 400 }
        }),

        // Patient Information
        new Paragraph({
          children: [
            new TextRun({
              text: 'Patient Information',
              bold: true,
              size: 28,
              underline: {}
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Patient: ${observation.patient_name || 'Unnamed Patient'}`,
              size: 24
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Observation Date: ${new Date(observation.observation_date).toLocaleDateString()}`,
              size: 24
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
              size: 24
            })
          ]
        }),

        // Administrative Notes section (if present)
        ...(observation.notes ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'Administrative Notes',
                bold: true,
                size: 28,
                underline: {}
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: observation.notes || '',
                size: 24
              })
            ],
            spacing: { after: 400 }
          })
        ] : [new Paragraph({ text: '', spacing: { after: 400 } })]),

        // Assessment Results Header
        new Paragraph({
          children: [
            new TextRun({
              text: 'Assessment Results',
              bold: true,
              size: 28,
              underline: {}
            })
          ],
          spacing: { before: 400, after: 200 }
        }),

        // Results by category
        ...categories.flatMap(category => {
          // ✅ FIX: use the joined category id safely
          const categoryResponses = (observation.responses || []).filter(
            r => r.question?.category?.id === category.id
          )

          if (categoryResponses.length === 0) return []

          // Get category notes from the first response (they should all be the same for a category)
          const categoryNotes = categoryResponses.length > 0 ? categoryResponses[0].category_notes : null
          return [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${category.name} (${category.type})`,
                  bold: true,
                  size: 26,
                  color: '1f2937'
                })
              ],
              spacing: { before: 300, after: 200 }
            }),

            // Create table for this category's responses
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 },
              },
              rows: [
                // Header row
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Question', bold: true, size: 22 })]
                      })],
                      width: { size: 60, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Score', bold: true, size: 22 })]
                      })],
                      width: { size: 15, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Description', bold: true, size: 22 })]
                      })],
                      width: { size: 25, type: WidthType.PERCENTAGE }
                    })
                  ]
                }),
                // Data rows
                ...categoryResponses.map(response =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({
                          // ✅ FIX: guard missing joins
                          children: [new TextRun({ text: response.question?.question_text || '(question unavailable)', size: 20 })]
                        })]
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({
                            text: `${response.score}/10`,
                            bold: true,
                            size: 20,
                            color: response.score >= 7 ? '059669' : response.score >= 4 ? 'ea580c' : 'dc2626'
                          })]
                        })]
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({
                            text: (legend.find(l => l.score === response.score)?.description) || '',
                            size: 20
                          })]
                        })]
                      })
                    ]
                  })
                )
              ]
            }),

            // Add category notes section if present
            ...(categoryNotes ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${category.name} Category Notes:`,
                    bold: true,
                    size: 22,
                    color: '374151'
                  })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: categoryNotes,
                    size: 20,
                    color: '4b5563'
                  })
                ],
                spacing: { after: 200 }
              })
            ] : []),
            new Paragraph({ text: '', spacing: { after: 200 } }) // Spacing after table
          ]
        }),

        // Scoring Legend
        new Paragraph({
          children: [
            new TextRun({
              text: 'Scoring Legend',
              bold: true,
              size: 28,
              underline: {}
            })
          ],
          spacing: { before: 600, after: 200 }
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
                  children: [new Paragraph({ children: [new TextRun({ text: 'Score', bold: true, size: 22 })] })],
                  width: { size: 20, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true, size: 22 })] })],
                  width: { size: 80, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            ...legend.map(item =>
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: item.score.toString(),
                        bold: true,
                        size: 20,
                        color: item.score >= 7 ? '059669' : item.score >= 4 ? 'ea580c' : 'dc2626'
                      })]
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: item.description, size: 20 })] })]
                  })
                ]
              })
            )
          ]
        })
      ]
    }]
  })

  const buffer = await Packer.toBuffer(doc)
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  const fileName = `observation-${(observation.patient_name || 'unnamed').replace(/[^a-zA-Z0-9]/g, '_')}-${observation.observation_date}.docx`
  saveAs(blob, fileName)
}

export const exportToCSV = async (
  observation: ObservationWithResponses,
  categories: CategoryWithQuestions[],
  legend: Legend[]
) => {
  // Helper to escape CSV values
  const escapeCSV = (value: unknown): string => {
    const s = (value ?? '').toString()
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }

  const headers = [
    'Patient Name',
    'Observation Date',
    'Category',
    'Category Type',
    'Question',
    'Score',
    'Score Description',
    'Question Notes',
    'Category Notes'
  ]

  const rows: string[][] = []

  // Add observation info and responses (null-safe joins)
  ;(observation.responses || []).forEach(response => {
    const category = response.question?.category
    const legendDescription = legend.find(l => l.score === response.score)?.description || ''

    rows.push([
      observation.patient_name || 'Unnamed Patient',
      observation.observation_date,
      category?.name || '',
      category?.type || '',
      response.question?.question_text || '',
      response.score?.toString() || '',
      legendDescription,
      response.notes || '',
      response.category_notes || ''
    ])
  })

  if (rows.length === 0) {
    rows.push([
      observation.patient_name || 'Unnamed Patient',
      observation.observation_date,
      '',
      '',
      'No responses recorded',
      '',
      '',
      '',
      observation.notes || ''
    ])
  }

  const csvContent = [
    ['CarerView Observation Export'],
    ['Generated:', new Date().toLocaleString()],
    [''],
    ['Administrative Notes:', observation.notes || 'None'],
    [''],
    headers,
    ...rows,
    [''],
    ['Scoring Legend:'],
    ['Score', 'Description'],
    ...legend.map(item => [item.score.toString(), item.description])
  ]
    .map(row => row.map(escapeCSV).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const fileName = `observation-${(observation.patient_name || 'unnamed').replace(/[^a-zA-Z0-9]/g, '_')}-${observation.observation_date}.csv`
  saveAs(blob, fileName)
}
