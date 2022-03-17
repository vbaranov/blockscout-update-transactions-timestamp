import * as pg from 'pg'
const { Pool } = pg.default

export const updateTransactionsV3 = async (start, end) => {
  return new Promise(async (resolve, reject) => {
    const pool = new Pool()
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      console.log(`Updating transactions rows for the range of block numbers ${start}..${end} started.`)
      const updateTransactionsQuery = `
      DO $$
      DECLARE
          blocks_scanned INTEGER := 0;
          temprow_blocks RECORD;
      BEGIN
          FOR cur_block_number IN ${start}..${end} LOOP
              FOR temprow_blocks IN
                  SELECT number, hash FROM blocks WHERE number=cur_block_number
              LOOP
                  blocks_scanned := blocks_scanned + 1;
                  IF EXISTS (
                      select 1 from transactions where block_hash = temprow_blocks.hash
                  ) THEN
                      UPDATE transactions tx
                      SET block_timestamp = c.timestamp
                      FROM (
                          SELECT hash, timestamp
                          FROM blocks
                          WHERE hash = temprow_blocks.hash
                      ) AS c
                      WHERE c.hash = tx.block_hash;
      
                      RAISE NOTICE 'Updated txs for block number %', temprow_blocks.number;
                  END IF;
      
                  IF MOD(blocks_scanned, 1000) = 0 THEN
                      RAISE NOTICE 'milestone: % blocks scanned', blocks_scanned;
                  END IF;
              END LOOP;
          END LOOP;
      END $$;`
      await client.query(updateTransactionsQuery)
      console.log(`Updating transactions rows for the range of block numbers ${start}..${end}. Commiting...`)
      await client.query('COMMIT')
      console.log(`Successfully committed transactions rows for the range of block numbers ${start}..${end}.`)
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
      client
      .end()
      .then(() => {
        console.log(`client has disconnected for the range of block numbers ${start}..${end}.`)
        resolve()
      })
      .catch(err => {
        console.error('error during disconnection', err.stack)
        reject()
      })
    }
  })
}
