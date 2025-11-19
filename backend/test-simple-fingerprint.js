const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// Import compiled service
const { FingerprintingService } = require('./dist/src/modules/fingerprinting/fingerprinting.service.js');
const { PrismaService } = require('./dist/src/common/prisma/prisma.service.js');

async function testFingerprinting() {
  console.log('Testing Audio Fingerprinting...\n');

  // Get a song from database
  const song = await prisma.song.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!song) {
    console.error('No songs found in database!');
    return;
  }

  console.log('Song:', song.title);
  console.log('Audio URL:', song.audioUrl);

  // Download audio file
  console.log('\nDownloading audio file...');
  const response = await axios.get(song.audioUrl, {
    responseType: 'arraybuffer',
    timeout: 30000,
  });
  const audioBuffer = Buffer.from(response.data);
  console.log('Downloaded:', (audioBuffer.length / 1024 / 1024).toFixed(2), 'MB');

  // Create service instance
  const prismaService = new PrismaService();
  const fingerprintingService = new FingerprintingService(prismaService);

  // Generate fingerprint
  console.log('\nGenerating fingerprint (this may take 10-30 seconds)...');
  try {
    const fingerprintData = await fingerprintingService.generateFingerprint(audioBuffer);
    console.log('\n✅ SUCCESS! Fingerprint generated:');
    console.log('   Landmarks:', fingerprintData.fingerprint.length);
    console.log('   Duration:', fingerprintData.duration, 's');
    console.log('   Sample Rate:', fingerprintData.sampleRate, 'Hz');

    // Store in database
    console.log('\nStoring fingerprint in database...');
    await prisma.audioFingerprint.deleteMany({ where: { songId: song.id } });
    await fingerprintingService.storeFingerprint(song.id, fingerprintData);
    console.log('✅ Fingerprint stored successfully!');

    // Verify
    const count = await prisma.audioFingerprint.count();
    console.log('\nTotal fingerprints in database:', count);

  } catch (error) {
    console.error('\n❌ FINGERPRINTING FAILED!');
    console.error('Error:', error.message);
    console.error('\nFull stack trace:');
    console.error(error.stack);
  }
}

testFingerprinting()
  .catch(error => {
    console.error('Fatal error:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
