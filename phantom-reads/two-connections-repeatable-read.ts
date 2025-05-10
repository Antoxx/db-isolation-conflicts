import assert from 'assert'
import { addOrders, countOrders, createConnectedClient, executeTransaction, ISOLATION_LEVEL, removeOrders } from '../utils.js'

const client1 = await createConnectedClient()
const client2 = await createConnectedClient()

const transactionLevel = ISOLATION_LEVEL.REPEATABLE_READ

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
    `Transaction 1`,
    async () => {
      await addOrders(client1)
      console.log(`[Transaction 1]: AFTER ADDING`)

      const ordersCnt = await countOrders(client1)
      console.log(`[Transaction 1]: AFTER COUNTING = ${ordersCnt}`)
      assert.equal(ordersCnt, 2, 'Transaction 1 has 2 orders')
    }
  ),
  executeTransaction(
    client2,
    transactionLevel,
    `Transaction 2`,
    async () => {
      let ordersCnt = await countOrders(client2)
      console.log(`[Transaction 2]: AFTER COUNTING 1 = ${ordersCnt}`)
      assert.equal(ordersCnt, 1, 'Transaction 2 has 1 order')
  
      await new Promise((res) => setTimeout(() => res(true), 100))
      console.log(`[Transaction 2]: AFTER WAITING`)
  
      ordersCnt = await countOrders(client2)
      console.log(`[Transaction 2]: AFTER COUNTING 2 = ${ordersCnt}`)
      assert.equal(ordersCnt, 1, 'Transaction 2 has 1 order after delay (NO phantoms read)')
    }
  ),
])

ordersCnt = await countOrders(client1)
assert.equal(ordersCnt, 2, 'END: 2 orders')

await client1.end()
await client2.end()