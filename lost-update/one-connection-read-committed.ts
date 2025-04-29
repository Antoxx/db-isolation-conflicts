import assert from 'assert'
import { createConnectedClient, increaseBalance, ISOLATION_LEVEL, logBalance, logIsolationLevel, resetBalance } from '../utils.js'

const client = await createConnectedClient()

await logIsolationLevel(client)

await resetBalance(client)
let balance = await logBalance(client)

await Promise.all([
  increaseBalance(client, 1.01),
  increaseBalance(client, 10.1),
])

balance = await logBalance(client) // 111.11 - OK
assert.equal(balance, 111.11)

await resetBalance(client)

await Promise.all([
  increaseBalance(client, 1.01, 200),
  increaseBalance(client, 10.1, 0),
])

balance = await logBalance(client) // 111.11 - OK
assert.equal(balance, 111.11)

await resetBalance(client)

await Promise.all([
  increaseBalance(client, 1.01, 200, ISOLATION_LEVEL.REPEATABLE_READ),
  increaseBalance(client, 10.1, 0, ISOLATION_LEVEL.REPEATABLE_READ),
])

balance = await logBalance(client) // 111.11 - OK
assert.equal(balance, 111.11)

await resetBalance(client)

await Promise.all([
  increaseBalance(client, 1.01, 200, ISOLATION_LEVEL.SERIALIZABLE),
  increaseBalance(client, 10.1, 0, ISOLATION_LEVEL.SERIALIZABLE),
])

balance = await logBalance(client) // 111.11 - OK
assert.equal(balance, 111.11)

await client.end()
