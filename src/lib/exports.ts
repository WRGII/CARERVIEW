import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from 'docx'
import { saveAs } from 'file-saver'
import { pdf } from '@react-pdf/renderer'
import type { ObservationWithResponses, CategoryWithQuestions, Legend } from './supabase'

export const exportToPDF = async (
  observation: ObservationWithResponses,
  categories: CategoryWithQuestions[],
  legend: Legend[]
) => {
  // Note: This would require implementing a proper PDF component
  // For now, we'll create a basic implementation
  const blob = new Blob(['PDF export would be implemented here'], { type: 'application/pdf' })
  saveAs(blob, `observation-${observation.id}.pdf`)
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
        new Paragraph({
          children: [
            new TextRun({
              text: 'CarerView Observation Report',
              bold: true,
              size: 32
            })
          ]
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
              text: `Date: ${new Date(observation.observation_date).toLocaleDateString()}`,
              size: 24
            })
          ]
        }),
        new Paragraph({ text: '' }), // Empty line
        
        // Add responses by category
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
                  size: 28
                })
              ]
            }),
            ...categoryResponses.map(response => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${response.question.question_text}: `,
                    size: 22
                  }),
                  new TextRun({
                    text: `${response.score}/10`,
                    bold: true,
                    size: 22
                  }),
                  new TextRun({
                    text: ` (${legend.find(l => l.score === response.score)?.description || ''})`,
                    size: 22
                  })
                ]
              })
            ),
            new Paragraph({ text: '' }) // Empty line
          ]
        }),

        // Add legend
        new Paragraph({
          children: [
            new TextRun({
              text: 'Scoring Legend',
              bold: true,
              size: 28
            })
          ]
        }),
        ...legend.map(item =>
          new Paragraph({
            children: [
              new TextRun({
                text: `${item.score}: ${item.description}`,
                size: 22
              })
            ]
          })
        )
      ]
    }]
  })

  const buffer = await Packer.toBuffer(doc)
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  saveAs(blob, `observation-${observation.id}.docx`)
}