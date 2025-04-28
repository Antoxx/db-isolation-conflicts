import { createConnectedClient, increaseBalance, ISOLATION_LEVEL, logBalance, resetBalance } from '../utils.js'

const client1 = await createConnectedClient()
const client2 = await createConnectedClient()

await resetBalance(client1)
await logBalance(client1)

await Promise.all([
  increaseBalance(client1, 1.01, 0, ISOLATION_LEVEL.SERIALIZABLE),
  increaseBalance(client2, 10.1, 0, ISOLATION_LEVEL.SERIALIZABLE),
])

await logBalance(client1) // 101.01 - the first is a winner with SERIALIZABLE

await client1.end()
await client2.end()