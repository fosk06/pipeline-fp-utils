'use strict';
import { map, fromCallback, tap, filter, fromArray } from '../lib/index.mjs';
import { expect } from 'chai';
import { pipeline } from 'stream/promises'
import { Writable } from 'stream'
import { writableNoopStream } from 'noop-stream';
import { Readable } from 'stream'

async function generateFakeRecords(inputs) {
    return [
        { firstName: "pierre", lastName: "do", age: inputs.age },
        { firstName: "jean", lastName: "yolo", age: inputs.age },
    ]
}

async function generateWrongValue(inputs) {
    return true
}

function getRandomIntAsync() {
    return Promise.resolve(Math.floor(Math.random() * 100))
}

function getRandomIntSync() {
    return Math.floor(Math.random() * 100)
}

describe('Test map function', () => {

    it('should return records untouched', async () => {
        try {
            await pipeline(
                await fromCallback({ callback: generateFakeRecords, inputs: { age: 10 } }),
                map(data => {
                    expect(data).to.have.property('firstName')
                    expect(data).to.have.property('lastName')
                    expect(data.age).to.be.equal(10)
                    return data
                }),
                map(JSON.stringify),
                writableNoopStream()
            )
        } catch (error) {
            console.error(error)
        }
    });

    it('should work with promises', async () => {
        try {
            await pipeline(
                fromArray([1, 2, 3]),
                map(getRandomIntAsync), // getRandomInt function return a promise
                map(data => {
                    expect(data).to.be.a('number');
                    return data
                }),
                map(JSON.stringify),
                writableNoopStream()
            )
        } catch (error) {
            console.error(error)
        }
    });

    it('should work with non promise callback', async () => {
        try {
            await pipeline(
                fromArray([1, 2, 3]),
                map(getRandomIntSync), // getRandomInt function return a number without promise
                map(data => {
                    expect(data).to.be.a('number');
                    return data
                }),
                map(JSON.stringify),
                writableNoopStream()
            )
        } catch (error) {
            console.error(error)
        }
    });

    it('should thow on invalid callback', async () => {
        try {
            await pipeline(
                await fromCallback({ callback: generateWrongValue, inputs: { age: 10 } }),
                map(JSON.stringify),
                writableNoopStream()
            )
        } catch (error) {
            expect(error.message).to.be.equal("The object returned by your callback is not iterable")
        }
    });
});


describe('Test filter function', () => {
    it('should filter even numbers', async () => {
        const isEven = d => (d % 2 === 0)
        const results = []
        try {
            await pipeline(
                fromArray([1, 2, 3, 4]),
                filter(isEven),
                map(d => {
                    results.push(d)
                    return d
                }),
                map(JSON.stringify),
                writableNoopStream()
            )
            expect(results).to.deep.equal([2, 4])
        } catch (error) {
            console.error(error)
        }
    });
})