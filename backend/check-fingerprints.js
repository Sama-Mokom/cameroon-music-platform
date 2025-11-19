const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFingerprints() {
  try {
    const fingerprintCount = await prisma.audioFingerprint.count();
    console.log('Total fingerprints in database:', fingerprintCount);

    const fingerprints = await prisma.audioFingerprint.findMany({
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artistId: true,
          },
        },
      },
    });

    console.log('\nFingerprint details:');
    fingerprints.forEach((fp, index) => {
      const landmarkCount = JSON.parse(fp.fingerprint).length;
      console.log(`${index + 1}. Song: "${fp.song.title}"`);
      console.log(`   - Landmarks: ${landmarkCount}`);
      console.log(`   - Duration: ${fp.duration}s`);
      console.log(`   - Sample Rate: ${fp.sampleRate}`);
      console.log();
    });

    const matchCount = await prisma.duplicateMatch.count();
    console.log(`Total duplicate matches created: ${matchCount}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFingerprints();
