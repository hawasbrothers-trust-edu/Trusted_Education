import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAdminRoutePath,
  validateMediaUpload,
  formatAudioSeconds,
  sanitizeUploadFilename,
  mergeSiteContentWithDefaults,
} from './cmsHelpers.ts';
import { DEFAULT_SITE_CONTENT } from '../data/defaultSiteContent.ts';

test('isAdminRoutePath matches /authr with or without trailing slash and ignores others', () => {
  assert.equal(isAdminRoutePath('/authr'), true);
  assert.equal(isAdminRoutePath('/authr/'), true);
  assert.equal(isAdminRoutePath('/AUTHR'), true);
  assert.equal(isAdminRoutePath('/'), false);
  assert.equal(isAdminRoutePath('/auth'), false);
});

test('validateMediaUpload enforces mime types and size limits for images and audio', () => {
  assert.equal(validateMediaUpload('image', 'image/png', 1024).valid, true);
  assert.equal(validateMediaUpload('image', 'application/pdf', 1024).valid, false);
  assert.equal(validateMediaUpload('image', 'image/jpeg', 12 * 1024 * 1024).valid, false);

  assert.equal(validateMediaUpload('audio', 'audio/mpeg', 2 * 1024 * 1024).valid, true);
  assert.equal(validateMediaUpload('audio', 'audio/wav', 500000).valid, true);
  assert.equal(validateMediaUpload('audio', 'video/mp4', 500000).valid, false);
  assert.equal(validateMediaUpload('audio', 'audio/mpeg', 25 * 1024 * 1024).valid, false);
});

test('formatAudioSeconds formats minutes and seconds properly', () => {
  assert.equal(formatAudioSeconds(0), '0:00');
  assert.equal(formatAudioSeconds(42), '0:42');
  assert.equal(formatAudioSeconds(125), '2:05');
  assert.equal(formatAudioSeconds(NaN), '0:00');
});

test('sanitizeUploadFilename removes unsafe characters while preserving extension', () => {
  assert.equal(sanitizeUploadFilename('صوت العميل #1.mp3'), '1.mp3');
  assert.equal(sanitizeUploadFilename('Hero Banner (Final)!.PNG'), 'Hero-Banner-Final.png');
});

test('mergeSiteContentWithDefaults preserves saved overrides and fills missing defaults', () => {
  const merged = mergeSiteContentWithDefaults(DEFAULT_SITE_CONTENT, {
    hero: {
      ...DEFAULT_SITE_CONTENT.hero,
      headline: 'عنوان مخصص جديد للباحثين',
    },
    contact: {
      ...DEFAULT_SITE_CONTENT.contact,
      phone: '+201000000000',
    },
  });

  assert.equal(merged.hero.headline, 'عنوان مخصص جديد للباحثين');
  assert.equal(merged.contact.phone, '+201000000000');
  assert.equal(merged.brand.shortName, DEFAULT_SITE_CONTENT.brand.shortName);
  assert.equal(merged.services.length, DEFAULT_SITE_CONTENT.services.length);
});
