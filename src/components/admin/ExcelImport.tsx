import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

export const ExcelImport: React.FC = () => {
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setResult(null)
    setError(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      // Process ADLs sheet
      if (workbook.SheetNames.includes('ADLs')) {
        const adlSheet = workbook.Sheets['ADLs']
        const adlData = XLSX.utils.sheet_to_json(adlSheet)
        await processCategories(adlData, 'ADL')
      }

      // Process IADLs sheet
      if (workbook.SheetNames.includes('IADLs')) {
        const iadlSheet = workbook.Sheets['IADLs']
        const iadlData = XLSX.utils.sheet_to_json(iadlSheet)
        await processCategories(iadlData, 'IADL')
      }

      // Process Legend sheet
      if (workbook.SheetNames.includes('Legend')) {
        const legendSheet = workbook.Sheets['Legend']
        const legendData = XLSX.utils.sheet_to_json(legendSheet)
        await processLegend(legendData)
      }

      setResult('Excel data imported successfully!')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['legend'] })
    } catch (err) {
      setError(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  const processCategories = async (data: any[], type: 'ADL' | 'IADL') => {
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      if (!row.name) continue

      // Insert/update category
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .upsert({
          name: row.name,
          type,
          ada_definition: row.ada_definition || '',
          ot_definition: row.ot_definition || '',
          sort_order: i
        })
        .select()
        .single()

      if (categoryError) {
        throw new Error(`Failed to insert category: ${categoryError.message}`)
      }

      // Process questions for this category
      if (row.questions) {
        const questions = Array.isArray(row.questions) ? row.questions : [row.questions]
        
        for (let j = 0; j < questions.length; j++) {
          const questionText = questions[j]
          if (!questionText) continue

          await supabase
            .from('questions')
            .upsert({
              category_id: category.id,
              question_text: questionText,
              sort_order: j
            })
        }
      }
    }
  }

  const processLegend = async (data: any[]) => {
    for (const row of data) {
      if (typeof row.score !== 'number' || !row.description) continue

      await supabase
        .from('legend')
        .upsert({
          score: row.score,
          description: row.description
        })
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-900">Excel Import</h3>
        <p className="text-slate-600">Import categories, questions, and legend from Excel file</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-slate-600">
                Select an Excel file with ADLs, IADLs, and Legend sheets
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={importing}
                className="block mx-auto text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {importing && (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Importing data...</span>
            </div>
          )}

          {result && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span>{result}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}