import { Client } from 'pg'

export const enum ISOLATION_LEVEL {
  READ_UNCOMMITTED = 'READ UNCOMMITTED',
  READ_COMMITTED = 'READ COMMITTED',
  REPEATABLE_READ = 'REPEATABLE READ',
  SERIALIZABLE = 'SERIALIZABLE',
}

export const createConnectedClient = async () => {
  const client = new Client({
    user: 'db-user',
    database: 'test',
    password: 'db-password',
  })
  await client.connect()

  return client
}

export const resetBalance = async (client: Client) => {
  client.query('UPDATE users SET balance = 100 WHERE id = 1')
}

export const logBalance = async (client: Client) => {
  const res = await client.query('SELECT balance FROM users WHERE id = 1')
  const balance = res.rows[0].balance
  console.log(`Balance: ${balance}`)
  return balance
}

export const logIsolationLevel = async (client: Client) => {
  const dtiRes = await client.query('SHOW default_transaction_isolation')
  const tiRes = await client.query('SHOW transaction_isolation')
  console.log(`TRANSACTION LEVEL: "${tiRes.rows[0].transaction_isolation}" (default = "${dtiRes.rows[0].default_transaction_isolation}")`)
}

export const setIsolationLevel = async (client: Client, level: ISOLATION_LEVEL) => {
  await client.query(`ALTER DATABASE test SET default_transaction_isolation TO "${level}"`)
}

export const executeTransaction = async (client: Client, transactionLevel: ISOLATION_LEVEL, name: string, callback: () => Promise<void>) => {
  await client.query(`BEGIN TRANSACTION ISOLATION LEVEL ${transactionLevel}`)
  console.log(`[${name}] in "${transactionLevel}": STARTED`)

  try {
    await callback()
    await client.query('COMMIT')
    console.log(`[${name}] in "${transactionLevel}": COMMITTED`)
  } catch (e: unknown) {
    await client.query('ROLLBACK')
    console.log(`[${name}] in "${transactionLevel}": ROLLBACKED (${(e as Error).message})`)
  }
}

export const increaseBalance = async (client: Client, sum: number, commitDelay = 0, transactionLevel = ISOLATION_LEVEL.READ_COMMITTED, beforeDelay = 0) => {
  await new Promise((res) => setTimeout(() => res(true), beforeDelay))

  console.log(`INCREASE balance in "${transactionLevel}" level with commit after ${commitDelay} msec: START`)

  await client.query(`BEGIN TRANSACTION ISOLATION LEVEL ${transactionLevel}`)

  try {
    await client.query('UPDATE users SET balance = balance + $1 WHERE id = 1', [sum])

    await new Promise((res) => {
      setTimeout(async () => {
        await client.query('COMMIT')
        console.log(`INCREASE balance in "${transactionLevel}" level with commit after ${commitDelay} msec: COMMITTED`)
        res(true)
      }, commitDelay)
    })
  } catch (e: unknown) {
    await client.query('ROLLBACK')
    console.log(`INCREASE balance in "${transactionLevel}" level with commit after ${commitDelay} msec: ROLLBACKED (${(e as Error).message})`)
  }
}

export const readAndIncreaseBalance = async (client: Client, sum: number, transactionLevel = ISOLATION_LEVEL.READ_COMMITTED, useBlocking = false) => {
  console.log(`READ AND INCREASE balance in "${transactionLevel}" level: START`)

  await client.query(`BEGIN TRANSACTION ISOLATION LEVEL ${transactionLevel}`)

  try {
    const res = await client.query('SELECT balance FROM users WHERE id = 1' + (useBlocking ? ' FOR UPDATE' : ''))
    const balance = res.rows[0].balance

    await client.query('UPDATE users SET balance = $1 WHERE id = 1', [balance + sum])

    await client.query('COMMIT')
    console.log(`READ AND INCREASE balance in "${transactionLevel}" level: COMMITTED`)
  } catch (e: unknown) {
    await client.query('ROLLBACK')
    console.log(`READ AND INCREASE balance in "${transactionLevel}" level: ROLLBACKED (${(e as Error).message})`)
  }
}

export const setBalance = async (client: Client, balance: number, commitDelay = 0, transactionLevel = ISOLATION_LEVEL.READ_COMMITTED) => {
  console.log(`SET balance in "${transactionLevel}" level with commit after ${commitDelay} msec: START`)

  await client.query(`BEGIN TRANSACTION ISOLATION LEVEL ${transactionLevel}`)

  try {
    await client.query('UPDATE users SET balance = $1 WHERE id = 1', [balance])

    await new Promise((res) => {
      setTimeout(async () => {
        await client.query('COMMIT')
        console.log(`SET balance in "${transactionLevel}" level with commit after ${commitDelay} msec: COMMITTED`)
        res(true)
      }, commitDelay)
    })
  } catch (e: unknown) {
    await client.query('ROLLBACK')
    console.log(`SET balance in "${transactionLevel}" level with commit after ${commitDelay} msec: ROLLBACKED (${(e as Error).message})`)
  }
}

export const countOrders = async (client: Client) => {
  const res = await client.query(`SELECT COUNT(*) FROM orders WHERE status = 'NEW'`)
  return Number(res.rows[0].count)
}

export const addOrders = async (client: Client, cnt = 1) => {
  const values = Array(cnt).fill(`(DEFAULT, 'NEW')`).join(',')
  return client.query(`INSERT INTO orders (id, status) VALUES ${values}`)
}

export const removeOrders = async (client: Client) => {
  return client.query(`TRUNCATE TABLE orders`)
}
