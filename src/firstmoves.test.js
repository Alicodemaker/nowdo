import { test } from 'node:test'
import assert from 'node:assert/strict'
import { firstMoves } from './firstmoves.js'

test('a Step about email suggests opening the inbox first', () => {
  assert.equal(firstMoves('Reply to the email from the landlord')[0], 'Open your inbox')
})

test('a Step about paying suggests opening the login page first', () => {
  assert.equal(firstMoves('Pay the electricity bill')[0], 'Open the website or bank app login page')
})

test('keywords match whole words only', () => {
  assert.notEqual(firstMoves('Repair the bike')[0], 'Open the website or bank app login page')
})

test('a Step with no keywords still gets the always-there first moves, starting with "Open your PC"', () => {
  assert.deepEqual(firstMoves('Sort the thing out'), [
    'Open your PC',
    'Get what you need in front of you',
    'Clear a small space to work',
    'Stand up and go to where it happens',
  ])
})

test('there are never more than 4 suggestions and no duplicates', () => {
  const moves = firstMoves('Write an email to the bank to pay the invoice and call them, then clean up')
  assert.equal(moves.length, 4)
  assert.equal(new Set(moves).size, 4)
})
