import { createConnectedClient, ISOLATION_LEVEL, logBalance, resetBalance, setBalance } from '../utils.js'

const client1 = await createConnectedClient()
const client2 = await createConnectedClient()

await resetBalance(client1)
await logBalance(client1)

await Promise.all([
  setBalance(client1, 111),
  setBalance(client2, 222),
])

await logBalance(client1) // 222 - the last is a winner with READ COMMITTED

await resetBalance(client1)

await Promise.all([
  setBalance(client1, 333, 200, ISOLATION_LEVEL.READ_COMMITTED),
  setBalance(client2, 444, 100, ISOLATION_LEVEL.READ_COMMITTED),
])

await logBalance(client1) // 333 - the first is a winner with DELAYED COMMIT

await client1.end()
await client2.end()