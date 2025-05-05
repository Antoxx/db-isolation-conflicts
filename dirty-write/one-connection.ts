import assert from 'assert'
import { createConnectedClient, ISOLATION_LEVEL, logBalance, logIsolationLevel, resetBalance, setBalance } from '../utils.js'

const client = await createConnectedClient()

await logIsolationLevel(client)

await resetBalance(client)
let balance = await logBalance(client)

await Promise.all([
  setBalance(client, 111),
  setBalance(client, 222),
])

// 222
// the last is a winner on READ COMMITTED
balance = await logBalance(client)
assert.equal(balance, 222)

await resetBalance(client)

await Promise.all([
  setBalance(client, 333, 500),
  setBalance(client, 444, 10),
])

// 444
// the last is still a winner on READ COMMITTED
await logBalance(client) 
balance = await logBalance(client)
assert.equal(balance, 444)

await resetBalance(client)

await Promise.all([
  setBalance(client, 555, 0, ISOLATION_LEVEL.REPEATABLE_READ),
  setBalance(client, 666, 0, ISOLATION_LEVEL.REPEATABLE_READ),
])

// 666
// the last is still a winner on REPEATABLE_READ
balance = await logBalance(client)
assert.equal(balance, 666)

await resetBalance(client)

await Promise.all([
  setBalance(client, 777, 0, ISOLATION_LEVEL.SERIALIZABLE),
  setBalance(client, 888, 0, ISOLATION_LEVEL.SERIALIZABLE),
])

// 888
// the last is still a winner on SERIALIZABLE
balance = await logBalance(client)
assert.equal(balance, 888)

await resetBalance(client)

await Promise.all([
  setBalance(client, 999, 500, ISOLATION_LEVEL.SERIALIZABLE),
  setBalance(client, 99, 50, ISOLATION_LEVEL.SERIALIZABLE),
])

// 99
// the last is still a winner on SERIALIZABLE with delay
balance = await logBalance(client)
assert.equal(balance, 99)

await client.end()
