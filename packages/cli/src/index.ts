#!/usr/bin/env node
import { Command } from 'commander'
import { initCommand } from './commands/init'

const program = new Command()

program
  .name('indigodb')
  .description('CLI for @adinet/indigodb')
  .version('2.0.0')

program.addCommand(initCommand)

program.parse(process.argv)
