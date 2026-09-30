import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mergePhrase } from './speech.js'

test('a phrase that just grows replaces the earlier version (Android)', () => {
  let phrases = []
  for (const p of ['so', 'so I', 'so I need', 'so I need to find an apartment']) phrases = mergePhrase(phrases, p)
  assert.deepEqual(phrases, ['so I need to find an apartment'])
})

test('a new phrase is added after the previous one', () => {
  let phrases = mergePhrase([], 'so I need to find an apartment')
  phrases = mergePhrase(phrases, 'then call the landlord')
  assert.deepEqual(phrases, ['so I need to find an apartment', 'then call the landlord'])
})

test('growing is matched regardless of capitals and spacing', () => {
  assert.deepEqual(mergePhrase(['So I'], ' so I need '), ['so I need'])
})

test('blank phrases are ignored', () => {
  assert.deepEqual(mergePhrase(['find the papers'], '   '), ['find the papers'])
})
