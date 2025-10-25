export const mockAnalyticsData = {
  'sales': [
    { month: 'Jan', value: 45000 },
    { month: 'Feb', value: 52000 },
    { month: 'Mar', value: 48000 },
    { month: 'Apr', value: 61000 },
    { month: 'May', value: 58000 },
    { month: 'Jun', value: 67000 }
  ],
  'users': [
    { id: 1, name: 'João Silva', age: 28, purchases: 1500 },
    { id: 2, name: 'Maria Santos', age: 35, purchases: 2300 },
    { id: 3, name: 'Pedro Costa', age: 42, purchases: 890 },
    { id: 4, name: 'Ana Lima', age: 31, purchases: 3200 },
    { id: 5, name: 'Carlos Souza', age: 29, purchases: 1750 }
  ],
  'products': [
    { sku: 'PRD001', name: 'Notebook', price: 3500, stock: 15 },
    { sku: 'PRD002', name: 'Mouse', price: 89, stock: 245 },
    { sku: 'PRD003', name: 'Teclado', price: 259, stock: 87 },
    { sku: 'PRD004', name: 'Monitor', price: 1299, stock: 32 },
    { sku: 'PRD005', name: 'Headset', price: 459, stock: 56 }
  ],
  'metrics': {
    totalSales: 321000,
    activeUsers: 1543,
    conversionRate: 3.4,
    avgOrderValue: 287,
    monthlyGrowth: 12.5
  },
  'analytics': {
    product_viewed: [],
    total_product_viewed: 0,
    sent_checkout: [],
    total_sent_checkout: 0,
    opened_ar: 0,
    opened_checkout: 0,
    items_purchased: [],
    total_items_purchased: 0,
    openings: 0,
    median_duration_per_session: 0,
    median_clicks_per_session: 0,
    median_loading_time: 0,
    accessories: [],
    total_accessories_interactions: 0,
    collection_item_view: [],
    total_collection_item_views: 0,
    median_product_view_time: 0,
    mobile_sessions: 1247,
    desktop_sessions: 856,
    tablet_sessions: 234,
    total_sessions: 2337
  }
}

export const exampleAPIs = [
  {
    name: 'JSONPlaceholder - Posts',
    url: 'https://jsonplaceholder.typicode.com/posts',
    description: 'Lista de posts',
    dataPath: ''
  },
  {
    name: 'JSONPlaceholder - Users',
    url: 'https://jsonplaceholder.typicode.com/users',
    description: 'Lista de usuários',
    dataPath: ''
  },
  {
    name: 'Random User',
    url: 'https://randomuser.me/api/?results=5',
    description: 'Usuários aleatórios',
    dataPath: 'results'
  },
  {
    name: 'CoinDesk Bitcoin Price',
    url: 'https://api.coindesk.com/v1/bpi/currentprice.json',
    description: 'Preço atual do Bitcoin',
    dataPath: 'bpi.USD.rate_float'
  },
  {
    name: 'Analytics - Mobile Sessions',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    description: 'Exemplo: extrair mobile_sessions',
    dataPath: 'mobile_sessions'
  }
]

export const extractValue = (data, path) => {
  if (!path || path === '') return data

  const keys = path.split('.')
  let result = data

  for (const key of keys) {
    if (result === null || result === undefined) return null

    if (key.includes('[') && key.includes(']')) {
      const arrayKey = key.substring(0, key.indexOf('['))
      const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')))
      result = result[arrayKey]?.[index]
    } else {
      result = result[key]
    }
  }

  return result
}

export const transformDataForProcessing = (data) => {
  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      index,
      value: typeof item === 'object' ? JSON.stringify(item) : item,
      raw: item
    }))
  }

  if (typeof data === 'object' && data !== null) {
    return Object.entries(data).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : value,
      raw: value
    }))
  }

  return data
}