# CarerView - Daily Functional Assessment and Observation System

For family and professional caregivers to record daily observations uting ADA and OT-aligned ADL & IADL categories.

## Features

### For Caregivers
- **Secure Token Access**: Access via private invite links without passwords
- **Interactive Scoring**: 1-10 sliders with per-question and bulk save options
- **ADA/OT Definitions**: Accessible tooltips with professional definitions
- **Export Capabilities**: DOCX and CSV exports for individual observations
- **Observation History**: View and manage all recorded observations

### For Administrators
- **Token Management**: Generate and manage secure access tokens
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

- `access_tokens` - Token-based access management
- `legend` - Score meanings (0-10 scale)
- `categories` - ADL/IADL categories with definitions
- `questions` - Assessment questions linked to categories
- `observations` - Caregiver observation sessions
- `responses` - Individual question scores

## Security Model

- **No Authentication**: Uses secure token-based access only
- **Row Level Security**: All data isolated by token_id
- **Token Hashing**: Tokens are hashed before storage
- **Role-Based Access**: Separate permissions for admins and caregivers

## Getting Started

1. **Setup Supabase**: Click "Connect to Supabase" and run the migrations
2. **Environment Variables**: Configure your Supabase URL and keys





3. **Generate Tokens**: Create invite links for caregivers and administrators
4. **Setup Categories**: Categories and questions are managed through the database

## Access URLs

- **Administrators**: `/admin?token=your_admin_token`
- **Caregivers**: `/caregiver?token=your_caregiver_token`

## Development

```bash
npm run dev    # Start development server
npm run build  # Build for production
```

## Deployment

The application is configured for Netlify deployment with:
- Automatic Supabase integration
- Serverless functions for token validation
- Environment variable management
- Custom domain support

Built with ❤️ for professional caregiving assessment.
