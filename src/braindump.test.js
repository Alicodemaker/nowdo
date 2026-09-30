import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitBrainDump } from './braindump.js'

test('one line per Step is kept as typed', () => {
  assert.deepEqual(splitBrainDump('Find MitID\nLog in to skat.dk\n\nCheck the numbers'), [
    'Find MitID',
    'Log in to skat.dk',
    'Check the numbers',
  ])
})

test('a spoken ramble splits on sentences and on "then", "and then", "after that", "and also"', () => {
  assert.deepEqual(
    splitBrainDump('so I need to find the papers. then log in to skat.dk and then check the numbers after that send it and also tell mum'),
    ['Find the papers', 'Log in to skat.dk', 'Check the numbers', 'Send it', 'Tell mum'],
  )
})

test('filler words at the start are dropped and the first letter is capitalised', () => {
  assert.deepEqual(splitBrainDump('um okay I have to clean the kitchen! I should like call the landlord?'), [
    'Clean the kitchen',
    'Call the landlord',
  ])
})

test('words that merely contain "then" or "also" are not split', () => {
  assert.deepEqual(splitBrainDump('Authenticate with MitID'), ['Authenticate with MitID'])
})

test('an empty or filler-only dump gives no Steps', () => {
  assert.deepEqual(splitBrainDump('  um. so. \n '), [])
})
