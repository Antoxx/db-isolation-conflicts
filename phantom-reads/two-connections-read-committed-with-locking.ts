import assert from 'assert'
import { addOrders, countOrders, createConnectedClient, executeTransaction, ISOLATION_LEVEL, removeOrders } from '../utils.js'

const client1 = await createConnectedClient()
const client2 = await createConnectedClient()

const transactionLevel = ISOLATION_LEVEL.READ_COMMITTED

let ordersCnt1 = 0
let ordersCnt2 = 0
let ordersCnt = 0

await removeOrders(client1)

await addOrders(client1)

ordersCnt1 = await countOrders(client1)
ordersCnt2 = await countOrders(client2)

assert.equal(ordersCnt1, 1)
assert.equal(ordersCnt1, ordersCnt2)

await Promise.all([
  executeTransaction(
    client1,
    transactionLevel,
    `Transaction 3`,
    async () => {
      await addOrders(client1)
      console.log('[Transaction 3]: AFTER ADDING')

      const ordersCnt = await countOrders(client1)
      console.log(`[Transaction 3]: AFTER COUNTING = ${ordersCnt}`)
      assert.equal(ordersCnt, 2, 'Transaction 1 has 2 orders')
    }
  ),
  executeTransaction(
    client2,
    transactionLevel,
    `Transaction 4`,
    async () => {
      // Fixing
      console.log('[Transaction 4]: BEFORE LOCK')
      await client2.query(`LOCK TABLE orders IN SHARE MODE`)
      console.log('[Transaction 4]: AFTER LOCK')
  
      let ordersCnt = await countOrders(client2)
      console.log(`[Transaction 4]: AFTER COUNTING 1 = ${ordersCnt}`)
      assert.equal(ordersCnt, 1, 'Transaction 2 has 1 order')
  
      await new Promise((res) => setTimeout(() => res(true), 3000))
      console.log('[Transaction 4]: AFTER WAITING')
  
      ordersCnt = await countOrders(client2)
      console.log(`[Transaction 4]: AFTER COUNTING 2 = ${ordersCnt}`)
      assert.equal(ordersCnt, 1, 'Transaction 2 has 1 order after delay due to TABLE LOCK')
    }
  ),
])

ordersCnt = await countOrders(client1)
assert.equal(ordersCnt, 2, 'END: 2 orders')

await client1.end()
await client2.end()