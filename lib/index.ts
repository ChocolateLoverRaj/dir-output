/**
 * @module dir-output 
 * @description An interface for managing a dir.
 */
import { promises as fs } from 'fs'
import { join } from 'path'

/**
 * DirOutput class
 */
class DirOutput {
  outputPath: string
  knowExist = new Map<string, boolean>()
  knowNoExist = new Set()

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
   * Remove a sub dir. Returns true if file was deleted, and false if file did not exist.
   * @param dir The name of the dir.
   * @returns {Promise}
   * @fulfil boolean
   */
  async removeDir (dir: string): Promise<boolean> {
    // Check if it doesn't exist
    if (this.knowNoExist.has(dir)) {
      return false
    }
    const done = () => {
      this.knowNoExist.add(dir)
    }
    try {
      await fs.rmdir(join(this.outputPath, dir))
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
}

export default DirOutput
