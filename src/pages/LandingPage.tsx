import React from 'react'
import { Activity, Shield, Database, FileText } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Activity className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            FAMOBS
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Functional Assessment and Monitoring Observation System
          </p>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            A professional platform for caregivers to record observation scores across 
            ADA/OT-aligned ADL & IADL categories with secure, token-based access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Secure Access</h3>
              </div>
              <p className="text-slate-600">
                Token-based authentication ensures secure access without passwords. 
                Private invite links provide controlled access for administrators and caregivers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Database-Driven</h3>
              </div>
              <p className="text-slate-600">
                All categories, questions, and scoring definitions are stored in Supabase 
                with real-time updates and Excel import capabilities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Professional Reports</h3>
              </div>
              <p className="text-slate-600">
                Export individual observations to PDF or DOCX formats with complete 
                scoring details and professional formatting.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">ADA/OT Aligned</h3>
              </div>
              <p className="text-slate-600">
                Built specifically for Activities of Daily Living (ADL) and Instrumental 
                Activities of Daily Living (IADL) assessments with professional definitions.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Access Required
            </h2>
            <p className="text-slate-600 mb-6">
              You need a valid access token to use FAMOBS. Contact your administrator 
              for an invite link to get started.
            </p>
            <div className="space-y-2 text-sm text-slate-500">
              <p><strong>Administrators:</strong> Access via /admin?token=your_token</p>
              <p><strong>Caregivers:</strong> Access via /caregiver?token=your_token</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}