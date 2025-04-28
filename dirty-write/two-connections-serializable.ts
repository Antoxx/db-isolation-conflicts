import { createConnectedClient, ISOLATION_LEVEL, logBalance, resetBalance, setBalance } from '../utils.js'

const client1 = await createConnectedClient()
const client2 = await createConnectedClient()

await resetBalance(client1)
await logBalance(client1)

await Promise.all([
  setBalance(client1, 111, 0, ISOLATION_LEVEL.SERIALIZABLE),
  setBalance(client2, 222, 0, ISOLATION_LEVEL.SERIALIZABLE),
])

await logBalance(client1) // 111 - the first is a winner with SERIALIZABLE

await client1.end()
await client2.end()