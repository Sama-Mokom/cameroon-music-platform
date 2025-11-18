const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const songs = await prisma.song.findMany({
    orderBy: { createdAt: 'desc' },
  });

  console.log('Songs in database:');
  console.log('==================\n');

  songs.forEach((song, index) => {
    console.log(`${index + 1}. ${song.title}`);
    console.log(`   Genre: ${song.genre || 'N/A'}`);
    console.log(`   URL: ${song.audioUrl}`);
    console.log(`   Created: ${song.createdAt}`);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
