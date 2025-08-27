import React, { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { useLegend } from '../../hooks/useLegend'
import { useSaveResponse, useSaveBulkResponses } from '../../hooks/useResponses'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Slider } from '../ui/Slider'
import { Loading } from '../ui/Loading'
import { Save, SaveAll, Info } from 'lucide-react'
import type { Question, CategoryWithQuestions } from '../../lib/supabase'

interface ObservationFormProps {
  observationId: string | null
  existingResponses?: Record<string, number>
}

export const ObservationForm: React.FC<ObservationFormProps> = ({
  observationId,
  existingResponses = {}
}) => {
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: legend, isLoading: legendLoading } = useLegend()
  const [scores, setScores] = useState<Record<string, number>>(existingResponses)
  const [showTooltips, setShowTooltips] = useState<Record<string, boolean>>({})

  const saveResponse = useSaveResponse()
  const saveBulkResponses = useSaveBulkResponses()
  
  // Debug logging
  console.log('ObservationForm rendered with observationId:', observationId)
  console.log('Categories loading:', categoriesLoading)
  console.log('Legend loading:', legendLoading)
  console.log('Categories data:', categories)
  console.log('Legend data:', legend)

  if (categoriesLoading || legendLoading) {
    console.log('Still loading categories or legend...')
    return <Loading message="Loading observation form..." />
  }

  if (!categories || !legend) {
    console.log('Categories or legend is null/undefined')
    console.log('Categories:', categories)
    console.log('Legend:', legend)
    return <div>Failed to load form data</div>
  }
  
  console.log('Categories loaded successfully:', categories.length, 'categories')
  console.log('Legend loaded successfully:', legend.length, 'legend items')

  if (!observationId) {
    console.log('No observationId provided')
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-600">No observation selected. Please create or select an observation to continue.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleScoreChange = (questionId: string, score: number) => {
    setScores(prev => ({ ...prev, [questionId]: score }))
  }

  const handleSaveQuestion = async (questionId: string) => {
    const score = scores[questionId]
    if (!score) return

    await saveResponse.mutateAsync({
      observation_id: observationId,
      question_id: questionId,
      score
    })
  }

  const handleSaveCategory = async (category: CategoryWithQuestions) => {
    const categoryResponses = category.questions
      .filter(q => scores[q.id])
      .map(q => ({
        observation_id: observationId,
        question_id: q.id,
        score: scores[q.id]
      }))

    if (categoryResponses.length === 0) return

    await saveBulkResponses.mutateAsync(categoryResponses)
  }

  const toggleTooltip = (categoryId: string) => {
    setShowTooltips(prev => ({ ...prev, [categoryId]: !prev[categoryId] }))
  }

  const getLegendDescription = (score: number): string => {
    const legendItem = legend.find(l => l.score === score)
    return legendItem?.description || ''
  }

  return (
    <div className="space-y-8">
      {/* Legend Reference */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Scoring Reference</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {legend.map(item => (
              <div key={item.score} className="flex items-center space-x-2">
                <span className="font-medium text-blue-600 w-6">{item.score}:</span>
                <span className="text-slate-700">{item.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories and Questions */}
      {categories.map(category => (
        <Card key={category.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-slate-900">
                  {category.name} ({category.type})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTooltip(category.id)}
                  className="p-1"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSaveCategory(category)}
                disabled={saveBulkResponses.isPending}
                className="flex items-center space-x-2"
              >
                <SaveAll className="w-4 h-4" />
                <span>Save All in Category</span>
              </Button>
            </div>
            
            {showTooltips[category.id] && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">ADA Definition:</h4>
                    <p className="text-slate-700">{category.ada_definition}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">OT Definition:</h4>
                    <p className="text-slate-700">{category.ot_definition}</p>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {category.questions.map(question => (
                <div key={question.id} className="space-y-4">
                  <h4 className="text-lg font-medium text-slate-800">
                    {question.question_text}
                  </h4>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Slider
                        value={scores[question.id] || 5}
                        onChange={(value) => handleScoreChange(question.id, value)}
                        min={1}
                        max={10}
                      />
                    </div>
                    <div className="w-20 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {scores[question.id] || 5}
                      </div>
                      <div className="text-xs text-slate-500">
                        Score
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSaveQuestion(question.id)}
                      disabled={saveResponse.isPending}
                      className="flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </Button>
                  </div>

                  {scores[question.id] && (
                    <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                      <strong>Score {scores[question.id]}:</strong> {getLegendDescription(scores[question.id])}
                    </div>
                  )}
                  
                  {question !== category.questions[category.questions.length - 1] && (
                    <hr className="border-slate-200" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}