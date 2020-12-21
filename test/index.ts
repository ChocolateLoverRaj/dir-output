/* eslint-env mocha */
import DirOutput, { PreCreate } from '../lib/index'
import mock from 'mock-fs'
import { strictEqual } from 'assert'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

beforeEach(() => {
  mock()
})

afterEach(() => {
  mock.restore()
})

describe('remove', () => {
  it('file', async () => {
    mkdirSync('path')
    writeFileSync('path/file', '')
    const dirOutput = new DirOutput('path')
    strictEqual(await dirOutput.remove('file'), true)
    strictEqual(existsSync('path/file'), false)
  })

  it('dir', async () => {
    mkdirSync('path')
    mkdirSync('path/dir')
    mkdirSync('path/dir/sub-dir')
    const dirOutput = new DirOutput('path')
    strictEqual(await dirOutput.remove('dir'), true)
    strictEqual(existsSync('path/dir'), false)
  })

  it('ENOENT', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    strictEqual(await dirOutput.remove('hi'), false)
  })

  it('sets knowNoExist', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    await dirOutput.remove('hi')
    strictEqual(dirOutput.knowNoExist.has('hi'), true)
  })

  it('reads knowNoExist', async () => {
    mkdirSync('path')
    writeFileSync('path/file', '')
    const dirOutput = new DirOutput('path')
    dirOutput.knowNoExist.add('file')
    strictEqual(await dirOutput.remove('file'), false)
    strictEqual(existsSync('path/file'), true)
  })

  it('uses preDelete', async () => {
    mkdirSync('path')
    writeFileSync('path/file', '')
    const dirOutput = new DirOutput('path')
    dirOutput.preDelete.set('file', Promise.resolve(false))
    strictEqual(await dirOutput.remove('file'), false)
    strictEqual(existsSync('path/file'), true)
  })

  it('sets preDelete', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    const remove = dirOutput.remove('file')
    strictEqual(await dirOutput.preDelete.get('file'), false)
    await remove
  })

  it('deletes preDelete', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    await dirOutput.remove('file')
    strictEqual(dirOutput.preDelete.has('file'), false)
  })

  it('sets preCreate', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    const remove = dirOutput.remove('file')
    strictEqual(await dirOutput.preCreate.get('file'), PreCreate.DELETED)
    await remove
  })

  it('deletes preCreate', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    await dirOutput.remove('file')
    strictEqual(dirOutput.preCreate.has('file'), false)
  })
})

describe('createDir', () => {
  it('create', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    await dirOutput.createDir('dir')
    strictEqual(existsSync('path/dir'), true)
  })

  describe('uses preCreate', () => {
    it('DELETED', async () => {
      mkdirSync('path')
      const dirOutput = new DirOutput('path')
      dirOutput.preCreate.set('dir', Promise.resolve(PreCreate.DELETED))
      await dirOutput.createDir('dir')
      strictEqual(existsSync('path/dir'), true)
    })

    describe('PRESERVED', () => {
      it('empty', async () => {
        mkdirSync('path')
        mkdirSync('path/dir')
        mkdirSync('path/dir/file')
        const dirOutput = new DirOutput('path')
        dirOutput.preCreate.set('dir', Promise.resolve(PreCreate.PRESERVED))
        await dirOutput.createDir('dir')
        strictEqual(existsSync('path/dir/file'), false)
      })

      it('not empty', async () => {
        mkdirSync('path')
        mkdirSync('path/dir')
        mkdirSync('path/dir/file')
        const dirOutput = new DirOutput('path')
        dirOutput.preCreate.set('dir', Promise.resolve(PreCreate.PRESERVED))
        await dirOutput.createDir('dir', false)
        strictEqual(existsSync('path/dir/file'), true)
      })
    })

    it('CREATED', async () => {
      mkdirSync('path')
      mkdirSync('path/dir')
      mkdirSync('path/dir/file')
      const dirOutput = new DirOutput('path')
      dirOutput.preCreate.set('dir', Promise.resolve(PreCreate.CREATED))
      await dirOutput.createDir('dir')
      strictEqual(existsSync('path/dir/file'), true)
    })
  })

  it('sets preCreate', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    const create = dirOutput.createDir('dir')
    strictEqual(await dirOutput.preCreate.get('dir'), PreCreate.CREATED)
    await create
  })

  it('deletes preCreate', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    await dirOutput.createDir('dir')
    strictEqual(dirOutput.preCreate.has('dir'), false)
  })
})
