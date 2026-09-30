import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sharedText } from './share.js'

const params = (query) => new URLSearchParams(query)

test('no shared text gives an empty string', () => {
  assert.equal(sharedText(params('')), '')
  assert.equal(sharedText(params('?text=%20%20')), '')
})

test('shared text is returned trimmed, keeping its lines', () => {
  assert.equal(sharedText(params('?text=%201.%20Open%20the%20laptop%0A2.%20Find%20the%20letter%0A')), '1. Open the laptop\n2. Find the letter')
})

test('the title is used only when there is no text', () => {
  assert.equal(sharedText(params('?title=Claude&text=Call%20the%20landlord')), 'Call the landlord')
  assert.equal(sharedText(params('?title=Call%20the%20landlord')), 'Call the landlord')
})

test('a shared link is added on its own line unless the text already has it', () => {
  assert.equal(sharedText(params('?text=Read%20this&url=https%3A%2F%2Fskat.dk')), 'Read this\nhttps://skat.dk')
  assert.equal(sharedText(params('?text=Go%20to%20https%3A%2F%2Fskat.dk&url=https%3A%2F%2Fskat.dk')), 'Go to https://skat.dk')
})
