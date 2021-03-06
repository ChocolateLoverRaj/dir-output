/* eslint-env mocha */
import DirOutput, { PreCreate, PreDelete } from '../lib/index'
import mock from 'mock-fs'
import { rejects, strictEqual } from 'assert'
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

  it('sets knowExist', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    dirOutput.knowExist.set('hi', false)
    await dirOutput.remove('hi')
    strictEqual(dirOutput.knowExist.has('hi'), false)
  })

  it('reads knowNoExist', async () => {
    mkdirSync('path')
    writeFileSync('path/file', '')
    const dirOutput = new DirOutput('path')
    dirOutput.knowNoExist.add('file')
    strictEqual(await dirOutput.remove('file'), false)
    strictEqual(existsSync('path/file'), true)
  })

  describe('reads additionalFiles', () => {
    it('not in knowExist', async () => {
      mkdirSync('path')
      writeFileSync('path/file', '')
      const dirOutput = new DirOutput('path')
      dirOutput.additionalFiles = false
      strictEqual(await dirOutput.remove('file'), false)
      strictEqual(existsSync('path/file'), true)
    })

    it('in knowExist', async () => {
      mkdirSync('path')
      writeFileSync('path/file', '')
      const dirOutput = new DirOutput('path')
      dirOutput.knowExist.set('file', false)
      dirOutput.additionalFiles = false
      strictEqual(await dirOutput.remove('file'), true)
      strictEqual(existsSync('path/file'), false)
    })
  })

  describe('uses preDelete', () => {
    it('DELETED', async () => {
      mkdirSync('path')
      writeFileSync('path/file', '')
      const dirOutput = new DirOutput('path')
      dirOutput.preDelete.set('file', Promise.resolve(PreDelete.DELETED))
      strictEqual(await dirOutput.remove('file'), true)
      strictEqual(existsSync('path/file'), true)
    })

    it('ENOENT', async () => {
      mkdirSync('path')
      writeFileSync('path/file', '')
      const dirOutput = new DirOutput('path')
      dirOutput.preDelete.set('file', Promise.resolve(PreDelete.ENOENT))
      strictEqual(await dirOutput.remove('file'), false)
      strictEqual(existsSync('path/file'), true)
    })
  })

  describe('sets preDelete', () => {
    it('DELETED', async () => {
      mkdirSync('path')
      writeFileSync('path/file', '')
      const dirOutput = new DirOutput('path')
      const remove = dirOutput.remove('file')
      strictEqual(await dirOutput.preDelete.get('file'), PreDelete.DELETED)
      await remove
    })

    it('ENOENT', async () => {
      mkdirSync('path')
      const dirOutput = new DirOutput('path')
      const remove = dirOutput.remove('file')
      strictEqual(await dirOutput.preDelete.get('file'), PreDelete.ENOENT)
      await remove
    })
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
    strictEqual((await dirOutput.createDir('dir')).outputPath, 'path/dir')
    strictEqual(existsSync('path/dir'), true)
  })

  it('sets knowExist', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    await dirOutput.createDir('dir')
    const knowExist = dirOutput.knowExist.get('dir')
    strictEqual(knowExist instanceof DirOutput, true)
    knowExist instanceof DirOutput && strictEqual(knowExist.outputPath, 'path/dir')
  })

  it('sets knowNoExist', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    dirOutput.knowNoExist.add('dir')
    await dirOutput.createDir('dir')
    strictEqual(dirOutput.knowNoExist.has('dir'), false)
  })

  describe('reads knowExist', () => {
    it('dir', async () => {
      mkdirSync('path')
      const dirOutput = new DirOutput('path')
      dirOutput.knowExist.set('dir', new DirOutput('path/dir'))
      await dirOutput.createDir('dir')
      strictEqual(existsSync('path/dir'), false)
    })

    it('file', async () => {
      mkdirSync('path')
      const dirOutput = new DirOutput('path')
      dirOutput.knowExist.set('dir', false)
      await rejects(dirOutput.createDir('dir'), new Error('Could not create dir because it already exists and is a file.'))
    })
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
        dirOutput.knowExist.set('dir', new DirOutput('path/dir'))
        await dirOutput.createDir('dir')
        strictEqual(existsSync('path/dir/file'), false)
      })

      it('not empty', async () => {
        mkdirSync('path')
        mkdirSync('path/dir')
        mkdirSync('path/dir/file')
        const dirOutput = new DirOutput('path')
        dirOutput.preCreate.set('dir', Promise.resolve(PreCreate.PRESERVED))
        dirOutput.knowExist.set('dir', new DirOutput('path/dir'))
        await dirOutput.createDir('dir', false)
        strictEqual(existsSync('path/dir/file'), true)
      })
    })

    it('DirOutput', async () => {
      mkdirSync('path')
      mkdirSync('path/dir')
      mkdirSync('path/dir/file')
      const dirOutput = new DirOutput('path')
      dirOutput.preCreate.set('dir', Promise.resolve(new DirOutput('path/dir')))
      await dirOutput.createDir('dir')
      strictEqual(existsSync('path/dir/file'), true)
    })
  })

  it('sets preCreate', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    const create = dirOutput.createDir('dir')
    const preCreate = await dirOutput.preCreate.get('dir')
    strictEqual(preCreate instanceof DirOutput, true)
    preCreate instanceof DirOutput && strictEqual(preCreate.outputPath, 'path/dir')
    await create
  })

  it('deletes preCreate', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    await dirOutput.createDir('dir')
    strictEqual(dirOutput.preCreate.has('dir'), false)
  })

  describe('sets preDelete', () => {
    it('create', async () => {
      mkdirSync('path')
      const dirOutput = new DirOutput('path')
      const update = dirOutput.createDir('dir')
      strictEqual(await dirOutput.preDelete.get('dir'), PreDelete.EXISTS)
      await update
    })

    it('empty', async () => {
      mkdirSync('path')
      const dirOutput = new DirOutput('path')
      const preCreate = Promise.resolve(PreCreate.PRESERVED)
      dirOutput.knowExist.set('dir', new DirOutput('path/dir'))
      dirOutput.preCreate.set('dir', preCreate)
      const update = dirOutput.createDir('dir')
      await preCreate
      strictEqual(await dirOutput.preDelete.get('dir'), PreDelete.EXISTS)
      await update
    })
  })

  describe('deletes preDelete', () => {
    it('create', async () => {
      mkdirSync('path')
      const dirOutput = new DirOutput('path')
      await dirOutput.createDir('dir')
      strictEqual(dirOutput.preDelete.has('dir'), false)
    })

    it('empty', async () => {
      mkdirSync('path')
      const dirOutput = new DirOutput('path')
      dirOutput.preCreate.set('dir', Promise.resolve(PreCreate.PRESERVED))
      dirOutput.knowExist.set('dir', new DirOutput('path/dir'))
      await dirOutput.createDir('dir')
      strictEqual(dirOutput.preDelete.has('dir'), false)
    })
  })
})

describe('empty', () => {
  describe('reads dir', () => {
    it('yes', async () => {
      mkdirSync('path')
      mkdirSync('path/dir')
      writeFileSync('path/file', '')
      const dirOutput = new DirOutput('path')
      await dirOutput.empty()
      strictEqual(existsSync('path/dir'), false)
      strictEqual(existsSync('path/file'), false)
    })

    it('no', async () => {
      mkdirSync('path')
      mkdirSync('path/dir')
      const dirOutput = new DirOutput('path')
      dirOutput.additionalFiles = false
      await dirOutput.empty()
      strictEqual(existsSync('path/dir'), true)
    })
  })

  it('clears knowNoExist', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    dirOutput.knowNoExist.add('file')
    await dirOutput.empty()
    strictEqual(dirOutput.knowNoExist.has('file'), false)
  })

  it('sets additionalFiles', async () => {
    mkdirSync('path')
    const dirOutput = new DirOutput('path')
    await dirOutput.empty()
    strictEqual(dirOutput.additionalFiles, false)
  })
})
