import { Command } from '@oclif/command'
import { buildProject } from '../buildProject'
import { getProjectFolders } from '../utils'
import path from 'path'
import Watch from './watch'

export default class Build extends Command {
  static description = 'Build the datapack. ⛏'

  static examples = [
    '$ sand build',
    '$ sand build --verbose',
    '$ sand build --verbose --dry',
  ]

  static flags = Watch.flags

  static args = Watch.args

  async run() {
    const { args, flags } = this.parse(Build)

    const folders = getProjectFolders(args.path)

     // Register ts-node
    require('ts-node').register({
      transpileOnly: true,
      project: path.join(folders.rootFolder, 'tsconfig.json'),
    })
    buildProject(flags, folders)
  }
}