import assert from 'assert'
import { createConnectedClient, ISOLATION_LEVEL, logBalance, readAndIncreaseBalance, resetBalance } from '../utils.js'

const client1 = await createConnectedClient()
const client2 = await createConnectedClient()

await resetBalance(client1)
let balance = await logBalance(client1)

await Promise.all([
  readAndIncreaseBalance(client1, 1.01, ISOLATION_LEVEL.READ_COMMITTED),
  readAndIncreaseBalance(client2, 10.1, ISOLATION_LEVEL.READ_COMMITTED),
])

// 110.1 - the second wins because it reads the old value 100
balance = await logBalance(client1)
assert.equal(balance, 110.1)

await resetBalance(client1)

// fix it by blocking
await Promise.all([
  readAndIncreaseBalance(client1, 1.01, ISOLATION_LEVEL.READ_COMMITTED, true),
  readAndIncreaseBalance(client2, 10.1, ISOLATION_LEVEL.READ_COMMITTED, true),
])

// 111.11 - serialize transactions by blocking FOR UPDATE
balance = await logBalance(client1)
assert.equal(balance, 111.11)

await client1.end()
await client2.end()