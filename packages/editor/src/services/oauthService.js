/**
 * OAuth Service
 * Handles Google OAuth flow for Analytics and Sheets
 */

/**
 * Initiate Google OAuth flow
 * @param {string} serviceType - 'analytics' or 'sheets'
 * @param {Object} apiConfig - { baseUrl, token }
 * @returns {Promise<void>} Redirects to Google OAuth
 */
export async function initiateGoogleOAuth(serviceType, apiConfig) {
  const baseUrl = apiConfig?.baseUrl || 'http://localhost:3001'
  const token = apiConfig?.token

  if (!token) {
    throw new Error('Authentication token required')
  }

  // Mapear serviceType para scopes
  const scopesMap = {
    'analytics': 'analytics',
    'sheets': 'sheets'
  }

  const scopes = scopesMap[serviceType]
  if (!scopes) {
    throw new Error(`Unknown service type: ${serviceType}`)
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/oauth/google/authorize?scopes=${scopes}&purpose=connection&serviceType=${serviceType}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `OAuth request failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data.authUrl) {
      throw new Error('No authorization URL returned from server')
    }


    // Redirecionar para Google
    window.location.href = data.authUrl
  } catch (error) {
    throw error
  }
}

/**
 * Handle OAuth callback from Google
 * @param {URLSearchParams} queryParams - URL query parameters
 * @returns {Object} { success: boolean, message: string, serviceType?: string, email?: string }
 */
export function handleOAuthCallback(queryParams) {
  const success = queryParams.get('success') === 'true'
  const serviceType = queryParams.get('serviceType')
  const email = queryParams.get('email')
  const errorMsg = queryParams.get('error')

  if (success && serviceType && email) {
    const serviceLabel = serviceType === 'analytics' ? 'Google Analytics' : 'Google Sheets'

    return {
      success: true,
      message: `${serviceLabel} conectado com sucesso!`,
      serviceType,
      email
    }
  } else if (errorMsg) {
    return {
      success: false,
      message: `Erro ao conectar: ${decodeURIComponent(errorMsg)}`
    }
  } else {
    return {
      success: false,
      message: 'Erro desconhecido ao processar callback OAuth'
    }
  }
}

/**
 * List all Google connections
 * @param {Object} apiConfig - { baseUrl, token }
 * @returns {Promise<Array>} Array of connections
 */
export async function listConnections(apiConfig) {
  const baseUrl = apiConfig?.baseUrl || 'http://localhost:3001'
  const token = apiConfig?.token

  if (!token) {
    throw new Error('Authentication token required')
  }

  try {
    const response = await fetch(`${baseUrl}/api/oauth/connections`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to list connections: ${response.status}`)
    }

    const data = await response.json()
    return data.connections || []
  } catch (error) {
    throw error
  }
}

/**
 * Revoke a Google connection
 * @param {string} connectionId - Connection ID to revoke
 * @param {Object} apiConfig - { baseUrl, token }
 * @returns {Promise<Object>} { success: boolean }
 */
export async function revokeConnection(connectionId, apiConfig) {
  const baseUrl = apiConfig?.baseUrl || 'http://localhost:3001'
  const token = apiConfig?.token

  if (!token) {
    throw new Error('Authentication token required')
  }

  try {
    const response = await fetch(`${baseUrl}/api/oauth/connections/${connectionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Failed to revoke connection: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw error
  }
}
