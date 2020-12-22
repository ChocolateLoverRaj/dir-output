/**
 * @module dir-output 
 * @description An interface for managing a dir.
 */
import { promises as fs } from 'fs'
import { emptyDir } from 'fs-extra'
import { join } from 'path'

export enum PreDelete {
  EXISTS = 0,
  ENOENT = 1,
  DELETED = 2
}

export enum PreCreate {
  DELETED = 0,
  PRESERVED = 1,
  CREATED = 2
}

/**
 * DirOutput class
 */
class DirOutput {
  outputPath: string
  knowExist = new Map<string, boolean>()
  knowNoExist = new Set()
  additionalFiles = false
  preDelete = new Map<string, Promise<PreDelete>>()
  preCreate = new Map<string, Promise<PreCreate>>()

  /**
   * @param outputPath The path to the dir.
   */
  constructor (outputPath: string) {
    this.outputPath = outputPath
  }

  /**
   * Remove all files and dirs in the output dir.
   * @returns {Promise}
   * @fulfil {void}
   */
  async empty (): Promise<void> {
    const files = await fs.readdir(this.outputPath, { withFileTypes: true })
    for (const file of files) {
      this.knowExist.set(file.name, file.isDirectory())
    }
    await Promise.all(files.map(async file => {
      const filePath = join(this.outputPath, file.name)
      if (file.isDirectory()) {
        await fs.rm(filePath, { recursive: true, force: true })
      } else {
        await fs.unlink(filePath)
      }
    }))
  }

  /**
   * Remove a file or recursively remove a dir. Returns true if file was deleted, and false if file did not exist.
   * @param file The name of the dir.
   * @returns {Promise}
   * @fulfil boolean
   */
  async remove (file: string): Promise<boolean> {
    // Check if it doesn't exist
    if (this.knowNoExist.has(file)) {
      return false
    }
    // Function to remove it
    const remove = async () => {
      const done = () => {
        this.knowExist.delete(file)
        this.knowNoExist.add(file)
        this.preDelete.delete(file)
        this.preCreate.delete(file)
      }
      try {
        await fs.rm(join(this.outputPath, file), { recursive: true })
        done()
        return true
      } catch (e) {
        if (e.code === 'ENOENT') {
          // ENOENT is okay
          done()
          return false
        } else {
          throw e
        }
      }
    }
    // Start removing
    const startRemoving = async () => {
      const preDelete = remove()
      this.preDelete.set(file, preDelete.then(deleted => deleted ? PreDelete.DELETED : PreDelete.ENOENT))
      this.preCreate.set(file, preDelete.then(() => PreCreate.DELETED))
      return await preDelete
    }
    // Wait for preDelete function, if it exists
    const preDelete = this.preDelete.get(file)
    if (preDelete) {
      const result = await preDelete
      if (result === PreDelete.DELETED) {
        return true
      } else if (result === PreDelete.ENOENT) {
        return false
      } else {
        return await startRemoving()
      }
    } else {
      return await startRemoving()
    }
  }

  /**
   * Creates a dir. If this dir was scheduled to be deleted by a `empty` operation, this dir is not deleted.
   * @param name=true The name of the dir.
   * @param empty Whether or not to empty the dir if it was preserved instead of deleted.
   */
  async createDir (name: string, empty = true): Promise<void> {
    // Check if it already exists as a dir
    const knowExist = this.knowExist.get(name)
    if (knowExist !== undefined) {
      if (knowExist) {
        return
      } else {
        // TODO: handle files
      }
    }

    const dirPath = join(this.outputPath, name)

    // Create
    const create = async () => {
      const create = fs.mkdir(dirPath)
      this.preDelete.set(name, create.then(() => PreDelete.EXISTS))
      this.preCreate.set(name, create.then(() => PreCreate.CREATED))
      await create
      this.knowNoExist.delete(name)
      this.knowExist.set(name, true)
      this.preDelete.delete(name)
      this.preCreate.delete(name)
    }
    // Check preCreate
    const preCreate = this.preCreate.get(name)
    if (preCreate) {
      const result = await preCreate
      if (result === PreCreate.DELETED) {
        await create()
      } else if (result === PreCreate.PRESERVED && empty) {
        const empty = emptyDir(dirPath)
        this.preDelete.set(name, empty.then(() => PreDelete.EXISTS))
        await empty
        this.preDelete.delete(name)
      }
    } else {
      await create()
    }
  }
}

export default DirOutput
