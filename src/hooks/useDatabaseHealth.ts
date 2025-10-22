import { useState, useEffect } from 'react';
import {
  validateDatabaseConnection,
  validateDatabaseSchema,
  validateEnvironmentVariables,
  retryConnection,
  type ConnectionStatus,
  type SchemaValidation,
} from '../lib/dbConnection';

interface DatabaseHealthState {
  isChecking: boolean;
  connectionStatus: ConnectionStatus | null;
  schemaValidation: SchemaValidation | null;
  envValidation: { isValid: boolean; errors: string[] } | null;
  overallStatus: 'healthy' | 'unhealthy' | 'checking' | 'unchecked';
}

export function useDatabaseHealth(checkOnMount = true) {
  const [state, setState] = useState<DatabaseHealthState>({
    isChecking: false,
    connectionStatus: null,
    schemaValidation: null,
    envValidation: null,
    overallStatus: 'unchecked',
  });

  const checkHealth = async () => {
    setState((prev) => ({ ...prev, isChecking: true, overallStatus: 'checking' }));

    const envValidation = validateEnvironmentVariables();

    if (!envValidation.isValid) {
      setState({
        isChecking: false,
        connectionStatus: null,
        schemaValidation: null,
        envValidation,
        overallStatus: 'unhealthy',
      });
      return;
    }

    const connectionStatus = await retryConnection(3, 1000);

    if (!connectionStatus.isConnected) {
      setState({
        isChecking: false,
        connectionStatus,
        schemaValidation: null,
        envValidation,
        overallStatus: 'unhealthy',
      });
      return;
    }

    const schemaValidation = await validateDatabaseSchema();

    const overallStatus = schemaValidation.isValid ? 'healthy' : 'unhealthy';

    setState({
      isChecking: false,
      connectionStatus,
      schemaValidation,
      envValidation,
      overallStatus,
    });
  };

  useEffect(() => {
    if (checkOnMount) {
      checkHealth();
    }
  }, [checkOnMount]);

  return {
    ...state,
    checkHealth,
    retry: checkHealth,
  };
}
