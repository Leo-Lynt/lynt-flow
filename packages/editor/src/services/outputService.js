/**
 * Output Service - Sends processed data to configured destinations
 * Integrates with backend output routes
 */

/**
 * Execute output based on destination type
 * @param {Object} outputData - The processed output data
 * @param {Object} destination - Destination config { type, config }
 * @param {Object} apiConfig - API configuration (baseUrl, token)
 * @returns {Promise<any>} - Result from the output operation
 */
export async function executeOutput(outputData, destination, apiConfig) {
  const { type, config } = destination


  // Display only - no action needed
  if (type === 'display') {
    return outputData
  }

  // API Response - return data (handled by flow execution)
  if (type === 'apiResponse') {
    return {
      _isApiResponse: true,
      data: outputData,
      config
    }
  }

  // Map destination types to API routes
  const routeMap = {
    'webhook': '/api/output/webhook',
    'email': '/api/output/email',
    'googleSheets': '/api/output/google-sheets',
    'download': '/api/output/download'
  }

  const route = routeMap[type]
  if (!route) {
    throw new Error(`Unknown destination type: ${type}`)
  }

  // All other types call backend routes
  const baseUrl = apiConfig.baseUrl || 'http://localhost:3001'
  const token = apiConfig.token

  if (!token) {
    throw new Error('Missing authentication token for output operation')
  }

  try {
    const response = await fetch(`${baseUrl}${route}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: outputData,
        config
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Output request failed' }))
      throw new Error(error.message || `Output failed with status ${response.status}`)
    }

    // Handle file downloads
    if (type === 'download') {
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Get filename from config or response headers
      const filename = config.filename || 'output'
      const extension = config.format === 'csv' ? 'csv' :
                       config.format === 'excel' ? 'xlsx' : 'json'
      a.download = `${filename}.${extension}`

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return { success: true, message: 'File downloaded successfully' }
    }

    const result = await response.json()
    return result

  } catch (error) {
    throw error
  }
}

/**
 * Get user-friendly output type name
 */
export function getOutputTypeName(type) {
  const names = {
    display: 'Display Only',
    api_response: 'API Response',
    webhook: 'Webhook',
    email: 'Email',
    google_sheets: 'Google Sheets',
    download: 'Download'
  }
  return names[type] || type
}

/**
 * Validate output configuration
 */
export function validateOutputConfig(type, config) {
  switch (type) {
    case 'webhook':
      if (!config.url) return { valid: false, error: 'Webhook URL is required' }
      break

    case 'email':
      if (!config.to) return { valid: false, error: 'Email recipients are required' }
      break

    case 'google_sheets':
      if (!config.spreadsheetUrl) return { valid: false, error: 'Spreadsheet URL is required' }
      if (!config.connectionId) return { valid: false, error: 'Google Sheets connection required' }
      break
  }

  return { valid: true }
}
