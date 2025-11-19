const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllSongs() {
  console.log('=== Clear All Songs Script ===\n');

  try {
    // Step 1: Get current counts
    console.log('Current database state:');
    const songCount = await prisma.song.count();
    const fingerprintCount = await prisma.audioFingerprint.count();
    const duplicateCount = await prisma.duplicateMatch.count();

    console.log(`  - Songs: ${songCount}`);
    console.log(`  - Fingerprints: ${fingerprintCount}`);
    console.log(`  - Duplicate matches: ${duplicateCount}`);

    if (songCount === 0) {
      console.log('\n✅ No songs to delete. Database is already clean.');
      return;
    }

    // Step 2: Show what will be deleted
    console.log('\nSongs that will be deleted:');
    const songs = await prisma.song.findMany({
      include: {
        artist: {
          select: {
            name: true,
          },
        },
      },
    });

    songs.forEach((song, index) => {
      console.log(`  ${index + 1}. "${song.title}" by ${song.artist.name}`);
    });

    console.log('\n⚠️  WARNING: This will delete:');
    console.log(`  - ${songCount} song(s)`);
    console.log(`  - ${fingerprintCount} fingerprint(s)`);
    console.log(`  - ${duplicateCount} duplicate match(es)`);
    console.log('  - Audio files will remain in Cloudinary (manual cleanup required)');

    // Step 3: Delete in correct order (respect foreign key constraints)
    console.log('\nDeleting data...\n');

    // Delete duplicate matches first (they reference songs)
    if (duplicateCount > 0) {
      const deletedMatches = await prisma.duplicateMatch.deleteMany({});
      console.log(`✅ Deleted ${deletedMatches.count} duplicate match(es)`);
    }

    // Delete fingerprints (they reference songs)
    if (fingerprintCount > 0) {
      const deletedFingerprints = await prisma.audioFingerprint.deleteMany({});
      console.log(`✅ Deleted ${deletedFingerprints.count} fingerprint(s)`);
    }

    // Delete songs
    const deletedSongs = await prisma.song.deleteMany({});
    console.log(`✅ Deleted ${deletedSongs.count} song(s)`);

    // Step 4: Verify database is clean
    console.log('\nVerifying database is clean...');
    const finalSongCount = await prisma.song.count();
    const finalFingerprintCount = await prisma.audioFingerprint.count();
    const finalDuplicateCount = await prisma.duplicateMatch.count();

    console.log(`  - Songs: ${finalSongCount}`);
    console.log(`  - Fingerprints: ${finalFingerprintCount}`);
    console.log(`  - Duplicate matches: ${finalDuplicateCount}`);

    if (finalSongCount === 0 && finalFingerprintCount === 0 && finalDuplicateCount === 0) {
      console.log('\n✅ SUCCESS! Database cleared successfully.');
      console.log('\nYou can now re-upload songs with working fingerprinting!');
    } else {
      console.log('\n⚠️  WARNING: Some data may not have been deleted.');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearAllSongs();
