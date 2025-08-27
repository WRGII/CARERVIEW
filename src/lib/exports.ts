import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'
import type { ObservationWithResponses, CategoryWithQuestions, Legend } from './supabase'

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
        
        // Notes section (if present)
        ...(observation.notes ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'Notes',
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
                text: observation.notes,
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
          const categoryResponses = observation.responses.filter(
            r => r.question.category_id === category.id
          )
          
          if (categoryResponses.length === 0) return []

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
                          children: [new TextRun({ text: response.question.question_text, size: 20 })]
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
                            text: legend.find(l => l.score === response.score)?.description || '',
                            size: 20
                          })]
                        })]
                      })
                    ]
                  })
                )
              ]
            }),
            
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
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Score', bold: true, size: 22 })]
                  })],
                  width: { size: 20, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Description', bold: true, size: 22 })]
                  })],
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
                    children: [new Paragraph({
                      children: [new TextRun({ text: item.description, size: 20 })]
                    })]
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
  const fileName = `observation-${observation.patient_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'unnamed'}-${observation.observation_date}.docx`
  saveAs(blob, fileName)
}

export const exportToCSV = async (
  observation: ObservationWithResponses,
  categories: CategoryWithQuestions[],
  legend: Legend[]
) => {
  // Helper function to escape CSV values
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  // CSV Header
  const headers = [
    'Patient Name',
    'Observation Date',
    'Category',
    'Category Type',
    'Question',
    'Score',
    'Score Description',
    'Notes'
  ]

  // CSV Rows
  const rows: string[][] = []

  // Add observation info and responses
  observation.responses.forEach(response => {
    const category = response.question.category
    const legendDescription = legend.find(l => l.score === response.score)?.description || ''
    
    rows.push([
      observation.patient_name || 'Unnamed Patient',
      observation.observation_date,
      category.name,
      category.type,
      response.question.question_text,
      response.score.toString(),
      legendDescription,
      response.notes || ''
    ])
  })

  // If no responses, add at least the observation info
  if (rows.length === 0) {
    rows.push([
      observation.patient_name || 'Unnamed Patient',
      observation.observation_date,
      '',
      '',
      'No responses recorded',
      '',
      '',
      observation.notes || ''
    ])
  }

  // Build CSV content
  const csvContent = [
    // Add metadata rows
    ['CarerView Observation Export'],
    ['Generated:', new Date().toLocaleString()],
    [''],
    ['Observation Notes:', observation.notes || 'None'],
    [''],
    // Add headers
    headers,
    // Add data rows
    ...rows,
    [''],
    ['Scoring Legend:'],
    ['Score', 'Description'],
    ...legend.map(item => [item.score.toString(), item.description])
  ]
    .map(row => row.map(escapeCSV).join(','))
    .join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const fileName = `observation-${observation.patient_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'unnamed'}-${observation.observation_date}.csv`
  saveAs(blob, fileName)
}