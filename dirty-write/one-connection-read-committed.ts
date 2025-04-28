import { createConnectedClient, logBalance, logIsolationLevel, resetBalance, setBalance } from '../utils.js'

const client = await createConnectedClient()

await logIsolationLevel(client)

await resetBalance(client)
await logBalance(client)

await Promise.all([
  setBalance(client, 111),
  setBalance(client, 222),
])

await logBalance(client) // 222 - the last is a winner on ANY ISOLATION LEVEL

await resetBalance(client)

await Promise.all([
  setBalance(client, 333, 500),
  setBalance(client, 444, 10),
])

await logBalance(client) // 444 - the last is still a winner

await client.end()
