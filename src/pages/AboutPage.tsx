// src/pages/AboutPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-gray mb-6">
            About CarerView
          </h1>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-warm-white rounded-2xl shadow-sm border border-slate-gray/10 p-8 md:p-12 mb-12">
            <div className="text-slate-gray leading-relaxed space-y-6 text-lg">
              <p>
                Caring for someone you love is never simple—especially when their abilities and needs change in ways that are unpredictable. Our family experienced this first-hand over seven years of dementia-related challenges with our mother. Every day brought something different. Some days felt like progress, others felt like setbacks. What we learned was that a single observation never told the full story. True understanding only came from seeing the patterns over time.
              </p>

              <p>
                After her passing, we asked ourselves what could have made the journey easier—not just for us, but for every family and care team navigating the same difficult path. That reflection became the foundation for CarerView.
              </p>

              <p>
                CarerView was created to fill a missing piece in caregiving: a simple, shared way to capture day-to-day changes, no matter how small or inconsistent they may seem. By collecting these observations in one place, families and professionals can see the bigger picture—spotting true trends, making better care decisions, and ensuring every voice in the care team is aligned.
              </p>

              <p>
                Our goal is to ease the stress, confusion, and isolation that so often comes with caregiving. We believe that when caregivers have clarity, they can give better care, and families can focus more on what matters most: time together.
              </p>

              <p className="font-medium text-slate-800">
                CarerView is more than a tool. It's our way of honoring our mother's memory by helping others through the same journey—so no family has to navigate it alone.
              </p>
            </div>
          </div>
        </div>

        {/* Call-to-Action Section */}
        <div className="bg-gradient-to-r from-mint-green/20 to-peach-blush/20 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0">
              <Link
                to="/create-account"
                className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200 hover:shadow-xl"
              >
                Start Observations <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex-1">
              <p className="text-slate-gray text-lg leading-relaxed">
                Join us in enhancing the caregiving experience. Start using CarerView today and bring clarity, confidence, and compassion into your care journey.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}