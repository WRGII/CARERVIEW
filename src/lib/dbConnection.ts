import { supabase } from './supabaseClient';

export interface ConnectionStatus {
  isConnected: boolean;
  error?: string;
  details?: {
    url: string;
    hasAuth: boolean;
    timestamp: number;
  };
}

export interface SchemaValidation {
  isValid: boolean;
  missingTables?: string[];
  error?: string;
}

export async function validateDatabaseConnection(): Promise<ConnectionStatus> {
  try {
    const { data, error } = await supabase
      .from('legend')
      .select('id')
      .limit(1);

    if (error) {
      return {
        isConnected: false,
        error: `Database query failed: ${error.message}`,
        details: {
          url: import.meta.env.VITE_SUPABASE_URL || 'Not configured',
          hasAuth: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          timestamp: Date.now(),
        },
      };
    }

    return {
      isConnected: true,
      details: {
        url: import.meta.env.VITE_SUPABASE_URL,
        hasAuth: true,
        timestamp: Date.now(),
      },
    };
  } catch (err) {
    return {
      isConnected: false,
      error: `Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      details: {
        url: import.meta.env.VITE_SUPABASE_URL || 'Not configured',
        hasAuth: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        timestamp: Date.now(),
      },
    };
  }
}

export async function validateDatabaseSchema(): Promise<SchemaValidation> {
  const requiredTables = [
    'legend',
    'categories',
    'questions',
    'observations',
    'responses',
    'profiles',
  ];

  try {
    const missingTables: string[] = [];

    for (const table of requiredTables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(0);

      if (error && error.message.includes('relation')) {
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      return {
        isValid: false,
        missingTables,
        error: `Missing tables: ${missingTables.join(', ')}`,
      };
    }

    return { isValid: true };
  } catch (err) {
    return {
      isValid: false,
      error: `Schema validation error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

export async function retryConnection(
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<ConnectionStatus> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const status = await validateDatabaseConnection();

    if (status.isConnected) {
      return status;
    }

    lastError = status.error || 'Unknown error';

    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  return {
    isConnected: false,
    error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`,
    details: {
      url: import.meta.env.VITE_SUPABASE_URL || 'Not configured',
      hasAuth: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      timestamp: Date.now(),
    },
  };
}

export function validateEnvironmentVariables(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is not set in .env file');
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://');
  } else if (!supabaseUrl.includes('.supabase.co')) {
    errors.push('VITE_SUPABASE_URL does not appear to be a valid Supabase URL');
  }

  if (!supabaseKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is not set in .env file');
  } else if (!supabaseKey.startsWith('eyJ')) {
    errors.push('VITE_SUPABASE_ANON_KEY does not appear to be a valid JWT token');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
