import { createReadStream, createWriteStream, unlinkSync, writeFile, writeFileSync, appendFileSync } from 'fs';
import { unlink } from 'fs/promises';



/** utility function to print what contain the stream, does not touch the original data
 * @param  {} data_gen
 */
async function* tap(data_gen) {
    for await (const data_item of data_gen) {
        console.log(data_item);
        yield JSON.stringify(data_item)
    }
}

/** take a callback to manipulate data, return a new data generator
* @param  {} callback
*/
function transformer(callback) {
    return async function* (data_generator) {
        for await (const data_item of data_generator) {
            yield await callback(data_item)
        }
    }
}

/** skip X first values in stream
 * @param  {} linesToSkip
 */
function skipLines(linesToSkip) {
    return async function* (data_generator) {
        let i = 0
        for await (const data_item of data_generator) {
            if (i > linesToSkip) {
                yield await data_item
            }
            i++
        }
    }
}

/** take a js object and serialize as jsonline
 * @param  {} str
 */
const toJsonLine = transformer(data => `${JSON.stringify(data)}${EOL}`)

/**
 * Merge two objects together
 * @param  {} meta
 * @param  {} =>transformer((data
 */
const mergeObjects = (metadata) => transformer((data) => {
    return {
        data,
        metadata
    }
})


export { transformer, mergeObjects, toJsonLine, tap };