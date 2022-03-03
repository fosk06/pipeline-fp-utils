'use strict';
const expect = require('chai').expect;
import { unlink } from '../lib/index.mjs';

describe('Test parseJsonFromBuffer function', () => {

    it('should return valid json', () => {
        const testBuffer = Buffer.from('eyJmaXJzdE5hbWUiOiJKb2huIiwibGFzdE5hbWUiOiJEb2UifQ')
        const result = parseJsonFromBuffer(testBuffer, 'base64')
        expect(result).to.deep.equal({ firstName: 'John', lastName: 'Doe' });
    });
});