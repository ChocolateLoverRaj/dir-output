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
  PRESERVED = 1
}

/**
 * DirOutput class
 */
class DirOutput {
  outputPath: string
  knowExist = new Map<string, false | DirOutput>()
  knowNoExist = new Set()
  additionalFiles = true
  preDelete = new Map<string, Promise<PreDelete>>()
  preCreate = new Map<string, Promise<PreCreate | DirOutput>>()

  /**
   * @param outputPath The path to the dir.
   */
  constructor (outputPath: string) {
    this.outputPath = outputPath
  }

  /**
   * Remove a file or recursively remove a dir. Returns true if file was deleted, and false if file did not exist.
   * @param file {string} The name of the dir.
   * @returns {Promise}
   * @fulfil boolean
   */
  async remove (file: string): Promise<boolean> {
    // Check if it doesn't exist
    if (this.knowNoExist.has(file) || (!this.knowExist.has(file) && !this.additionalFiles)) {
      return false
    }
    // Function to remove it
    const remove = async (): Promise<boolean> => {
      const done = (): void => {
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
    const startRemoving = async (): Promise<boolean> => {
      const preDelete = remove()
      this.preDelete.set(file, preDelete.then(deleted => deleted ? PreDelete.DELETED : PreDelete.ENOENT))
      this.preCreate.set(file, preDelete.then(() => PreCreate.DELETED))
      return await preDelete
    }
    // Wait for preDelete function, if it exists
    const preDelete = this.preDelete.get(file)
    if (preDelete !== undefined) {
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
   * Creates a dir. If this dir was scheduled to be deleted by a `empty` operation, this dir is not deleted. Returns a DirOutput with the outputPath being the path of the dir that was created.
   * @param name {string} The name of the dir.
   * @param empty=true {boolean} Whether or not to empty the dir if it was preserved instead of deleted.
   * @returns {Promise}
   * @fulfil DirOutput
   */
  async createDir (name: string, empty: boolean = true): Promise<DirOutput> {
    // Check if it already exists as a dir
    const preCreate = this.preCreate.get(name)
    const knowExist = this.knowExist.get(name)
    if (knowExist !== undefined && preCreate === undefined) {
      if (knowExist instanceof DirOutput) {
        return knowExist
      } else {
        throw new Error('Could not create dir because it already exists and is a file.')
      }
    }

    const dirPath = `${this.outputPath}/${name}`

    // Create
    const create = async (): Promise<DirOutput> => {
      const create = fs.mkdir(dirPath)
      this.preDelete.set(name, create.then(() => PreDelete.EXISTS))
      this.preCreate.set(name, create.then(() => new DirOutput(dirPath)))
      await create
      this.knowNoExist.delete(name)
      const dirOutput = new DirOutput(dirPath)
      this.knowExist.set(name, dirOutput)
      this.preDelete.delete(name)
      this.preCreate.delete(name)
      return dirOutput
    }
    // Check preCreate
    if (preCreate !== undefined) {
      const result = await preCreate
      if (result instanceof DirOutput) {
        return result
      } else {
        if (result === PreCreate.DELETED) {
          return await create()
        } else {
          if (empty) {
            const empty = emptyDir(dirPath)
            this.preDelete.set(name, empty.then(() => PreDelete.EXISTS))
            await empty
            this.preDelete.delete(name)
          }
          const knowExist = this.knowExist.get(name)
          if (knowExist instanceof DirOutput) {
            return knowExist
          } else {
            throw new Error('knowExist should be an instance of DirOutput, but it isn\'t. This is an internal bug.')
          }
        }
      }
    } else {
      return await create()
    }
  }

  /**
   * Remove all files and dirs in the output dir.
   * @returns {Promise}
   * @fulfil void
   */
  async empty (): Promise<void> {
    if (this.additionalFiles) {
      const files = await fs.readdir(this.outputPath, { withFileTypes: true })
      this.knowExist.clear()
      this.knowNoExist.clear()
      this.additionalFiles = false
      files.forEach(file => {
        this.knowExist.set(file.name, file.isDirectory()
          ? new DirOutput(join(this.outputPath, file.name))
          : false)
      })
    }
    await Promise.all([...this.knowExist.keys()].map(async file => await this.remove(file)))
  }
}

export default DirOutput
