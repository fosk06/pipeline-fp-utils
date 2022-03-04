import { pipeline } from 'stream/promises'
import { Readable } from 'stream'

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
function map(callback) {
    return async function* (data_generator) {
        for await (const data_item of data_generator) {
            yield await callback(data_item)
        }
    }
}

const isIterable = (value) => {
    return Symbol.iterator in Object(value);
}

/** take a callback and input, return a generator that fetch the data with your callback and emit value for each iteration
* @param  {} callback a function that return an iterable (for example an array)
* @param  {} inputs inputs passed to the callback
*/
async function fromCallback({ callback, inputs }) {
    return async function* () {
        const data = await callback(inputs)
        if (isIterable(data) === false) {
            throw new Error('The object returned by your callback is not iterable')
        }
        for await (const data_item of data) {
            yield data_item
        }
    }
}

function fromArray(data) {
    if (Array.isArray(data) === false) {
        throw new Error('data must be an array')
    }
    return Readable.from(data)
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

/** skip X first values in stream
 * @param  {} assertCallback a function that evalate a data object and return true or false, on true the data is return, on false it's skipped
 */
function filter(assertCallback) {
    if (typeof assertCallback != "function") {
        throw new Error('assertion callback must be a function')
    }
    return async function* (data_generator) {
        for await (const data_item of data_generator) {
            const isValid = assertCallback(data_item)
            if (typeof isValid != "boolean") {
                throw new Error('assertion callback must return a boolean')
            }
            if (isValid === true) {
                yield data_item
            }
        }
    }
}

/** take a js object and serialize as jsonline
 * @param  {} str
 */
const toJsonLine = map(data => `${JSON.stringify(data)}${EOL}`)

/**
 * Merge two objects together
 * @param  {} meta
 * @param  {} =>map((data
 */
const mergeObjects = (metadata) => map((data) => {
    return {
        ...data,
        ...metadata
    }
})


export { map, mergeObjects, toJsonLine, tap, fromCallback, filter, fromArray };