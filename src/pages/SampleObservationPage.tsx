// src/pages/SampleObservationPage.tsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabasePublic } from '../lib/supabaseClient'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { formatDate } from '../lib/utils'
import { ArrowLeft, User, Calendar, Phone, FileText } from 'lucide-react'
import { ScoreLegendDisplay } from '../components/caregiver/ScoreLegendDisplay'

interface SampleObservation {
  id: string
  patient_name: string
  observation_date: string
  mode_of_observation: string
  notes: string
  caregiver_name: string
  caregiver_email: string
  created_at: string
  updated_at: string
  sample_responses?: Array<{
    id: string
    score: number
    notes: string | null
    question: {
      question_text: string
      sort_order: number
      category: {
        id: string
        name: string
        type: 'ADL' | 'IADL'
      }
    }
  }>
}

export default function SampleObservationPage() {
  const [observation, setObservation] = useState<SampleObservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getOrCreateSampleObservation = async (): Promise<SampleObservation> => {
    // Find existing sample observation from dedicated sample tables
    const { data: existing, error: selectError } = await supabasePublic
      .from('sample_observations')
      .select(`
        id, patient_name, observation_date, mode_of_observation, notes, 
        caregiver_name, caregiver_email, created_at, updated_at,
        sample_responses:sample_responses (
          id, score, notes,
          question:questions (
            question_text, sort_order,
            category:categories ( id, name, type )
          )
        )
      `)
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle()

    if (selectError) {
      throw new Error(`Failed to fetch sample observation: ${selectError.message}`)
    }

    if (existing) {
      return existing as SampleObservation
    }

    // Sample observation not found
    throw new Error('Sample observation not found. Please ensure the sample data migration has been run.')
  }

  useEffect(() => {
    const loadSampleObservation = async () => {
      try {
        setLoading(true)
        setError(null)
        const sampleObs = await getOrCreateSampleObservation()
        setObservation(sampleObs)
      } catch (err: any) {
        setError(err.message || 'Failed to load sample observation')
      } finally {
        setLoading(false)
      }
    }

    loadSampleObservation()
  }, [])

  if (loading) {
    return <Loading message="Loading sample observation..." />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!observation) {
    return <ErrorMessage message="Sample observation not found" />
  }

  // Group responses by category
  const categorizedResponses = new Map<string, {
    id: string
    name: string
    type: 'ADL' | 'IADL'
    responses: Array<{
      score: number
      notes: string | null
      question: {
        question_text: string
        sort_order: number
      }
    }>
  }>()

  observation.sample_responses?.forEach(response => {
    const category = response.question?.category
    if (!category) return

    if (!categorizedResponses.has(category.id)) {
      categorizedResponses.set(category.id, {
        id: category.id,
        name: category.name,
        type: category.type,
        responses: []
      })
    }

    categorizedResponses.get(category.id)!.responses.push({
      score: response.score,
      notes: response.notes,
      question: {
        question_text: response.question.question_text,
        sort_order: response.question.sort_order
      }
    })
  })

  // Sort categories: ADL before IADL, then by name
  const categories = Array.from(categorizedResponses.values())
  categories.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'ADL' ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })

  // Sort questions within each category by sort_order
  categories.forEach(category => {
    category.responses.sort((a, b) => a.question.sort_order - b.question.sort_order)
  })

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 rounded-lg border border-slate-gray/30 px-4 py-2 text-slate-gray hover:bg-peach-blush/20 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              <h1 className="text-2xl font-bold text-slate-gray">Sample Observation</h1>
            </div>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex items-center space-x-2 print:hidden"
            >
              <FileText className="w-4 h-4" />
              <span>Print</span>
            </Button>
          </div>

          {/* Introduction */}
          <Card className="bg-gradient-to-r from-cyan-primary/5 to-mint-green/10 border-cyan-primary/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-slate-gray mb-3">
                Welcome to CarerView's Sample Observation
              </h2>
              <p className="text-slate-gray/80 leading-relaxed">
                This sample demonstrates how CarerView captures daily functional assessments using 
                a clear 1-5 scale. Each observation documents Activities of Daily Living (ADL) and 
                Instrumental Activities of Daily Living (IADL) to help families and healthcare 
                providers track changes in independence levels over time.
              </p>
            </CardContent>
          </Card>

          {/* Header card with observation details */}
          <Card className="bg-warm-white">
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-gray">Observation Details</h3>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-slate-gray/60" />
                  <div>
                    <p className="text-sm text-slate-gray/70">Patient Name</p>
                    <p className="font-medium text-slate-gray">{observation.patient_name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-slate-gray/60" />
                  <div>
                    <p className="text-sm text-slate-gray/70">Observation Date</p>
                    <p className="font-medium text-slate-gray">
                      {formatDate(observation.observation_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-slate-gray/60" />
                  <div>
                    <p className="text-sm text-slate-gray/70">Mode of Observation</p>
                    <p className="font-medium text-slate-gray">{observation.mode_of_observation}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-slate-gray/60" />
                  <div>
                    <p className="text-sm text-slate-gray/70">Caregiver</p>
                    <p className="font-medium text-slate-gray">{observation.caregiver_name}</p>
                    <p className="text-sm text-slate-gray/60">{observation.caregiver_email}</p>
                  </div>
                </div>
              </div>

              {observation.notes && (
                <div className="mt-6 pt-4 border-t border-slate-gray/20">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-slate-gray/60 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-gray/70 mb-1">Notes</p>
                      <p className="text-slate-gray">{observation.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Responses grouped by category */}
          {categories.length > 0 ? (
            <div className="space-y-6">
              {categories.map(category => (
                <Card key={category.id} className="bg-warm-white">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-slate-gray">
                        {category.name}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        category.type === 'ADL'
                          ? 'bg-cyan-primary/20 text-cyan-primary'
                          : 'bg-mint-green/60 text-slate-gray'
                      }`}>
                        {category.type}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.responses.map((response, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-slate-gray/10 last:border-b-0">
                          <div className="flex-1 mb-2 sm:mb-0">
                            <p className="text-slate-gray">{response.question.question_text}</p>
                            {response.notes && (
                              <p className="text-sm text-slate-gray/70 mt-1">{response.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-semibold ${
                              response.score >= 4
                                ? 'bg-mint-green/60 text-slate-gray'
                                : response.score >= 3
                                ? 'bg-cyan-primary/20 text-cyan-primary'
                                : 'bg-peach-blush/60 text-slate-gray'
                            }`}>
                              {response.score}
                            </span>
                            <span className="text-slate-gray/60 text-sm">/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-warm-white">
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-gray/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-gray mb-2">No Responses</h3>
                  <p className="text-slate-gray/70">This sample observation is being prepared with assessment data.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score Legend Display */}
          <ScoreLegendDisplay />

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-cyan-primary/5 to-mint-green/10 border-cyan-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-slate-gray mb-3">
                Ready to start your own observations?
              </h3>
              <p className="text-slate-gray/80 mb-4">
                Create your CarerView account and begin documenting daily functional assessments 
                with the same clear, professional approach shown in this sample.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200"
              >
                Get Started with CarerView
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}