import { createConnectedClient, increaseBalance, ISOLATION_LEVEL, logBalance, resetBalance } from '../utils.js'

const client1 = await createConnectedClient()
const client2 = await createConnectedClient()

await resetBalance(client1)
await logBalance(client1)

await Promise.all([
  increaseBalance(client1, 1.01),
  increaseBalance(client2, 10.1),
])

await logBalance(client1) // 111.11 - OK

await resetBalance(client1)

await Promise.all([
  increaseBalance(client1, 1.01, 200, ISOLATION_LEVEL.READ_COMMITTED),
  increaseBalance(client2, 10.1, 100, ISOLATION_LEVEL.READ_COMMITTED),
])

await logBalance(client1) // 111.11 - OK

await client1.end()
await client2.end()