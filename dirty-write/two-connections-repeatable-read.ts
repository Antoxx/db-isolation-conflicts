import { createConnectedClient, ISOLATION_LEVEL, logBalance, resetBalance, setBalance } from '../utils.js'

const client1 = await createConnectedClient()
const client2 = await createConnectedClient()

await resetBalance(client1)
await logBalance(client1)

await Promise.all([
  setBalance(client1, 111, 0, ISOLATION_LEVEL.REPEATABLE_READ),
  setBalance(client2, 222, 0, ISOLATION_LEVEL.REPEATABLE_READ),
])

// 111
// the first is a winner with REPEATABLE_READ
// the second failed with error "could not serialize access due to concurrent update"
await logBalance(client1)

await client1.end()
await client2.end()