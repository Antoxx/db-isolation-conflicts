import assert from 'assert'
import { createConnectedClient, increaseBalance, ISOLATION_LEVEL, logBalance, resetBalance } from '../utils.js'

const client1 = await createConnectedClient()
const client2 = await createConnectedClient()

await resetBalance(client1)
let balance = await logBalance(client1)

await Promise.all([
  increaseBalance(client1, 1.01, 0, ISOLATION_LEVEL.SERIALIZABLE),
  increaseBalance(client2, 10.1, 0, ISOLATION_LEVEL.SERIALIZABLE),
])

balance = await logBalance(client1) 
// 101.01
// the first is a winner with SERIALIZABLE
// the second failed with error "could not serialize access due to concurrent update"
assert.equal(balance, 101.01)

await resetBalance(client1)

await Promise.all([
  increaseBalance(client1, 1.01, 100, ISOLATION_LEVEL.SERIALIZABLE, 30),
  increaseBalance(client2, 10.1, 500, ISOLATION_LEVEL.SERIALIZABLE, 1),
])

// 110.1
// the second is a winner with SERIALIZABLE (started later but finished fast)
// the first failed with error "could not serialize access due to concurrent update"
balance = await logBalance(client1) 
assert.equal(balance, 110.1)

await client1.end()
await client2.end()