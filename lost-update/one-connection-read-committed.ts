import { createConnectedClient, increaseBalance, ISOLATION_LEVEL, logBalance, logIsolationLevel, resetBalance } from '../utils.js'

const client = await createConnectedClient()

await logIsolationLevel(client)

await resetBalance(client)
await logBalance(client)

await Promise.all([
  increaseBalance(client, 1.01),
  increaseBalance(client, 10.1),
])

await logBalance(client) // 111.11 - OK

await resetBalance(client)

await Promise.all([
  increaseBalance(client, 1.01, 200),
  increaseBalance(client, 10.1, 0),
])

await logBalance(client) // 111.11 - OK

await resetBalance(client)

await Promise.all([
  increaseBalance(client, 1.01, 200, ISOLATION_LEVEL.REPEATABLE_READ),
  increaseBalance(client, 10.1, 0, ISOLATION_LEVEL.REPEATABLE_READ),
])

await logBalance(client) // 111.11 - OK

await resetBalance(client)

await Promise.all([
  increaseBalance(client, 1.01, 200, ISOLATION_LEVEL.SERIALIZABLE),
  increaseBalance(client, 10.1, 0, ISOLATION_LEVEL.SERIALIZABLE),
])

await logBalance(client) // 111.11 - OK

await client.end()
