/* eslint-env mocha */
import DirOutput from '../lib/index'
import { strictEqual } from 'assert'

it('new', () => {
  const dirOutput = new DirOutput('path')
  strictEqual(dirOutput.outputPath, 'path')
})
