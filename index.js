import { updateTransactionsV3 } from './postgres-communication.module.js'

const initialBlockNumber = process.env['INITIAL_BLOCK_NUMBER'] && parseInt(process.env['INITIAL_BLOCK_NUMBER']) || 0
const finalBlockNumber = process.env['FINAL_BLOCK_NUMBER'] && parseInt(process.env['FINAL_BLOCK_NUMBER']) || 900000
const tasksBlocksRange = process.env['TASKS_BLOCK_RANGE'] && parseInt(process.env['TASKS_BLOCK_RANGE']) || 100
const tasksConcurrency = process.env['TASKS_CONCURRENCY'] && parseInt(process.env['TASKS_CONCURRENCY']) || 100
const blocksInTheTasksPool = tasksBlocksRange * tasksConcurrency

async function updateTransactionsPool(tasksBlocksRange, blocksOffset, tasksConcurrency) {
    return new Promise(resolve => {
        var calls = []
        for (let i = 1; i <= tasksConcurrency; i++) {
            let start = blocksOffset + (i - 1) * tasksBlocksRange
            let end = blocksOffset + i * tasksBlocksRange
            calls.push(updateTransactionsV3(start, end))
        }
        Promise.all(calls).then(_values => {
            resolve()
        })
    })
}

function updateAllTransactions(blocksOffset) {
    updateTransactionsPool(tasksBlocksRange, blocksOffset, tasksConcurrency)
    .then(_ => {
        let newBlocksOffset = blocksOffset + blocksInTheTasksPool
        if (newBlocksOffset < finalBlockNumber) {
            return updateAllTransactions(newBlocksOffset)
        } else {
            console.log('Update of transactions table finished!')
            return
        }
    })
}

updateAllTransactions(initialBlockNumber)