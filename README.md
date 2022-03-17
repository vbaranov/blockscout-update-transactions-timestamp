## Description

Script for filling block timestamp in Blockscout transactions table in batches as a part of Blockscout DB denormalization for the sake of queries performance

Usage example:

```
PGHOST=localhost \
PGUSER=db_user \
PGPASSWORD=db_password \
PGDATABASE=explorer \
PGPORT=5432 \
INITIAL_BLOCK_NUMBER=0 \
FINAL_BLOCK_NUMBER=1000 \
TASKS_BLOCK_RANGE=200 \
TASKS_CONCURRENCY=50 \
node index.js
```
