# CarerView - Daily functional assessment system easy!

For family caregivers to record and discuss daily observations using ADA and OT categories.

## Features

### For Caregivers
- **Interactive Scoring**: 1-5 sliders with per-question and bulk save options
- **ADA/OT Definitions**: Accessible tooltips with professional definitions
- **ADA/OT Categories and Questions**: Guiding the Caregiver through daily observations step-by-step.
- **Export Capabilities**: DOCX and CSV exports for individual observations
- **Observation History**: View and manage all recorded observations

### For Administrators
- **Aggregate Analytics**: View system-wide statistics and trends
- **Data Oversight**: Monitor caregiver activity and observation patterns

## Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **State Management**: React Query for server state
- **Database**: Supabase Postgres with Row Level Security
- **Authentication**: Token-based access (no password auth)
- **Deployment**: Netlify with serverless functions
- **Exports**: @react-pdf/renderer and docx libraries

## Database Architecture

All data is stored in Supabase with proper RLS policies:

- `legend` - Score meanings (1-5 scale)
- `categories` - ADL/IADL categories with definitions
- `questions` - Assessment questions linked to categories
- `observations` - Caregiver observation sessions
- `responses` - Individual question scores

## Security Model

- **Row Level Security**: All data isolated by token_id
- **Role-Based Access**: Separate permissions for admins and caregivers

## Getting Started

1. **Setup Supabase**: COMPLETED
2. **Environment Variables**: COMPLETED
3. **Setup Categories**: COMPLETED
4. **Setup Questions**: COMPLETED

## Sample Observation Demo

CarerView includes a sample observation feature that demonstrates the assessment process:

- **Route**: Visit `/sample` to view a realistic sample observation
- **Auto-creation**: The sample observation is automatically created on first visit if it doesn't exist
- **Public access**: The sample observation is publicly viewable (no authentication required)
- **RLS policy**: A Row Level Security policy ensures only the sample observation is accessible to anonymous users
- **Database setup**: Run the migration `supabase/migrations/20250112_sample_observation_public_read.sql` to enable public access to the sample data

The sample demonstrates:
- Typical scoring patterns across ADL and IADL categories
- Professional notes and observations
- The 1-5 CarerView scoring system
- Export-ready format for healthcare discussions

## Development

```bash
npm run dev    # Start development server
npm run build  # Build for production
```

## Deployment

The application is publishing for MVP deployment with:
- Automatic Supabase integration
- Environment variable management
- Netlify deployment

Built with ❤️ for family caregiving assessment.
