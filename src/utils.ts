import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execSync } from 'node:child_process'
import chalk from 'chalk-template'

export function hasYarn(): boolean {
  try {
    execSync('yarn --version')
    return true
  } catch (_) {
    return false
  }
}
export function hasPnpm(): boolean {
  try {
    execSync('pnpm --version')
    return true
  } catch (_) {
    return false
  }
}
export function hasBun(): boolean {
  try {
    execSync('bun --version')
    return true;
  } catch (_) {
    return false
  }
}

/**
 * Recursively search for a file.
 * Starts in the current folder, and go to the parent, recursively.
 *
 * @param filename the name of the file to resolve
 * @param from the path to start at
 *
 * @return The path on success, `null` if no the file is found in any parent.
 */
export function getFileFolder(filename: string, from = '.'): string | null {
  let fileFolder = path.resolve(from)

  while (!fs.existsSync(path.join(fileFolder, filename))) {
    // Go up 1 folder
    const newFileFolder = path.dirname(fileFolder)

    if (newFileFolder === fileFolder) {
      // If we arrived to the root folder, give up.
      return null
    }

    fileFolder = newFileFolder
  }

  return fileFolder
}

export type ProjectFolders = { absProjectFolder: string, projectFolder: string, rootFolder: string, sandstoneConfigFolder: string }

export function getProjectFolders(projectFolder: string): ProjectFolders {
  const absProjectFolder = path.resolve(projectFolder)

  /// GETTING ALL MANDATORY FILES ///
  // Resolve the location of package.json, in order to get the node_modules folder.
  const rootFolder = getFileFolder('package.json', projectFolder)
  if (!rootFolder) {
    throw new Error(chalk`{red Failed to find {bold package.json} in the "${absProjectFolder}" folder, or in any parent folder.}`)
  }

  // Resolve the location of sandstone.config.ts
  const sandstoneConfigFolder = getFileFolder('sandstone.config.ts', projectFolder)
  if (!sandstoneConfigFolder) {
    throw new Error(chalk`{red Failed to find {bold sandstone.config.ts} in the "${absProjectFolder}" folder, or in any parent folder.}`)
  }

  return {
    absProjectFolder, projectFolder, rootFolder, sandstoneConfigFolder
  }
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/**
 * Get the .minecraft path
 */
export function getMinecraftPath(): string {
  function getMCPath(): string {
    switch (os.platform()) {
    case 'win32':
      return path.join(os.homedir(), 'AppData/Roaming/.minecraft')
    case 'darwin':
      return path.join(os.homedir(), 'Library/Application Support/minecraft')
    case 'linux':
    default:
      return path.join(os.homedir(), '.minecraft')
    }
  }

  const mcPath = getMCPath()

  if (!fs.existsSync(mcPath)) {
    throw new Error('Unable to locate the .minecraft folder. Please specify it manually.')
  }

  return mcPath
}

export function getWorldsList(clientPath?: string): string[] {
  const mcPath = clientPath || getMinecraftPath()
  const savesPath = path.join(mcPath, 'saves')

  return fs.readdirSync(
    savesPath,
    { withFileTypes: true }
  ).filter((f) => f.isDirectory).map((f) => f.name)
}