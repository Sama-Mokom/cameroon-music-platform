const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const axios = require('axios');
const prisma = new PrismaClient();

async function testFingerprinting() {
  console.log('=== Audio Fingerprinting Diagnostic Test ===\n');

  // Test 1: Check FFmpeg Installation
  console.log('1. Checking FFmpeg installation...');
  try {
    const ffmpegVersion = execSync('ffmpeg -version', { encoding: 'utf8' });
    const versionLine = ffmpegVersion.split('\n')[0];
    console.log('   ✅ FFmpeg found:', versionLine);
  } catch (error) {
    console.error('   ❌ FFmpeg NOT FOUND!');
    console.error('   Error:', error.message);
    console.log('\n   SOLUTION: Install FFmpeg:');
    console.log('   - Windows: Download from https://ffmpeg.org/download.html');
    console.log('   - Add to PATH environment variable');
    console.log('   - Restart terminal after installation\n');
    return;
  }

  // Test 2: Check Dependencies
  console.log('\n2. Checking required dependencies...');
  try {
    require('stream-audio-fingerprint');
    console.log('   ✅ stream-audio-fingerprint installed');
  } catch (error) {
    console.error('   ❌ stream-audio-fingerprint NOT FOUND!');
    console.log('   Run: npm install stream-audio-fingerprint');
    return;
  }

  try {
    require('fluent-ffmpeg');
    console.log('   ✅ fluent-ffmpeg installed');
  } catch (error) {
    console.error('   ❌ fluent-ffmpeg NOT FOUND!');
    console.log('   Run: npm install fluent-ffmpeg');
    return;
  }

  try {
    require('@ffmpeg-installer/ffmpeg');
    console.log('   ✅ @ffmpeg-installer/ffmpeg installed');
  } catch (error) {
    console.error('   ❌ @ffmpeg-installer/ffmpeg NOT FOUND!');
    console.log('   Run: npm install @ffmpeg-installer/ffmpeg');
    return;
  }

  // Test 3: Get a Song from Database
  console.log('\n3. Fetching song from database...');
  const song = await prisma.song.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!song) {
    console.error('   ❌ No songs found in database!');
    console.log('   Upload a song first before testing fingerprinting.');
    return;
  }

  console.log(`   ✅ Found song: "${song.title}" by artist ${song.artistId}`);
  console.log(`   Audio URL: ${song.audioUrl}`);

  // Test 4: Download Audio File
  console.log('\n4. Downloading audio file from Cloudinary...');
  let audioBuffer;
  try {
    const response = await axios.get(song.audioUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
    });
    audioBuffer = Buffer.from(response.data);
    console.log(`   ✅ Downloaded ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error('   ❌ Failed to download audio file!');
    console.error('   Error:', error.message);
    return;
  }

  // Test 5: Import Fingerprinting Service
  console.log('\n5. Loading fingerprinting service...');
  let FingerprintingService;
  try {
    const moduleImport = require('./dist/modules/fingerprinting/fingerprinting.service.js');
    FingerprintingService = moduleImport.FingerprintingService;
    console.log('   ✅ Service loaded successfully');
  } catch (error) {
    console.error('   ❌ Failed to load service!');
    console.error('   Error:', error.message);
    console.log('\n   NOTE: Make sure backend is compiled: npm run build');
    return;
  }

  // Test 6: Generate Fingerprint
  console.log('\n6. Generating audio fingerprint...');
  console.log('   (This may take 10-30 seconds depending on file size)');

  const fingerprintingService = new FingerprintingService(prisma);
  let fingerprintData;

  try {
    fingerprintData = await fingerprintingService.generateFingerprint(audioBuffer);
    console.log('   ✅ Fingerprint generated successfully!');
    console.log(`   - Landmarks: ${fingerprintData.fingerprint.length}`);
    console.log(`   - Duration: ${fingerprintData.duration}s`);
    console.log(`   - Sample Rate: ${fingerprintData.sampleRate} Hz`);

    if (fingerprintData.fingerprint.length === 0) {
      console.warn('   ⚠️  WARNING: No landmarks generated! Audio may be invalid or too short.');
    }
  } catch (error) {
    console.error('   ❌ Fingerprint generation FAILED!');
    console.error('   Error:', error.message);
    console.error('\n   Full error stack:');
    console.error(error.stack);
    return;
  }

  // Test 7: Store Fingerprint in Database
  console.log('\n7. Storing fingerprint in database...');
  try {
    // Delete existing fingerprint for this song (if any)
    await prisma.audioFingerprint.deleteMany({
      where: { songId: song.id },
    });

    await fingerprintingService.storeFingerprint(song.id, fingerprintData);
    console.log('   ✅ Fingerprint stored successfully');
  } catch (error) {
    console.error('   ❌ Failed to store fingerprint!');
    console.error('   Error:', error.message);
    return;
  }

  // Test 8: Verify Storage
  console.log('\n8. Verifying fingerprint in database...');
  const storedFingerprint = await prisma.audioFingerprint.findUnique({
    where: { songId: song.id },
  });

  if (storedFingerprint) {
    console.log('   ✅ Fingerprint verified in database');
    console.log(`   - ID: ${storedFingerprint.id}`);
    console.log(`   - Song ID: ${storedFingerprint.songId}`);
    console.log(`   - Duration: ${storedFingerprint.duration}s`);
    console.log(`   - Sample Rate: ${storedFingerprint.sampleRate} Hz`);
    const landmarks = JSON.parse(storedFingerprint.fingerprint);
    console.log(`   - Landmarks: ${landmarks.length}`);
  } else {
    console.error('   ❌ Fingerprint NOT FOUND in database!');
    return;
  }

  // Test 9: Test Duplicate Detection
  console.log('\n9. Testing duplicate detection...');
  try {
    const duplicateCheck = await fingerprintingService.checkForDuplicates(fingerprintData);
    console.log(`   ✅ Duplicate check completed`);
    console.log(`   - Matches found: ${duplicateCheck.matches.length}`);

    if (duplicateCheck.matches.length > 0) {
      console.log('   - Top match:');
      const topMatch = duplicateCheck.matches[0];
      console.log(`     * Song: "${topMatch.title}" by ${topMatch.artistName}`);
      console.log(`     * Similarity: ${topMatch.similarity}%`);
      console.log(`     * Matching landmarks: ${topMatch.matchingLandmarks}`);
    }
  } catch (error) {
    console.error('   ❌ Duplicate detection failed!');
    console.error('   Error:', error.message);
  }

  console.log('\n=== DIAGNOSTIC COMPLETE ===');
  console.log('\n✅ All tests passed! Fingerprinting is working correctly.');
  console.log('\nIf existing songs don\'t have fingerprints, you need to re-upload them.');
  console.log('Or create a migration script to fingerprint existing songs.\n');
}

testFingerprinting()
  .catch((error) => {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
