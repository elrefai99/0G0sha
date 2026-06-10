const PG_SSL_MODES_TO_VERIFY_FULL = new Set(['prefer', 'require', 'verify-ca'])

export const getPostgresConnectionString = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    return connectionString
  }

  const url = new URL(connectionString)
  const sslMode = url.searchParams.get('sslmode')

  if (sslMode && PG_SSL_MODES_TO_VERIFY_FULL.has(sslMode)) {
    url.searchParams.set('sslmode', 'verify-full')
  }

  return url.toString()
}
