import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.safetySignal.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.matchProfile.deleteMany();
  await prisma.match.deleteMany();
  await prisma.report.deleteMany();
  await prisma.block.deleteMany();
  await prisma.like.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.profilePhoto.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const users = [
    {
      email: "mei@example.test",
      displayName: "Mei",
      city: "Taipei",
      country: "TW",
      intent: "MARRIAGE",
      languages: ["zh-TW", "en"],
      birthYear: 1993
    },
    {
      email: "daniel@example.test",
      displayName: "Daniel",
      city: "Taipei",
      country: "TW",
      intent: "SERIOUS_RELATIONSHIP",
      languages: ["zh-TW", "en"],
      birthYear: 1991
    },
    {
      email: "aisha@example.test",
      displayName: "Aisha",
      city: "Singapore",
      country: "SG",
      intent: "MARRIAGE",
      languages: ["en", "ms"],
      birthYear: 1992
    }
  ] as const;

  for (const seedUser of users) {
    const user = await prisma.user.create({
      data: {
        email: seedUser.email,
        displayName: seedUser.displayName,
        passwordHash: "mock-password-hash",
        locale: seedUser.country === "TW" ? "zh-TW" : "en"
      }
    });

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        displayName: seedUser.displayName,
        birthYear: seedUser.birthYear,
        gender: "PREFER_NOT_TO_SAY",
        city: seedUser.city,
        country: seedUser.country,
        intent: seedUser.intent,
        languages: [...seedUser.languages],
        bio: "Looking for an intentional, kind relationship.",
        photos: {
          create: [
            {
              url: `https://example.test/photos/${seedUser.displayName.toLowerCase()}.jpg`,
              position: 0,
              isPrimary: true
            }
          ]
        },
        preference: {
          create: {
            minAge: 28,
            maxAge: 40,
            countries: ["TW", "SG", "MY"],
            cities: [seedUser.city],
            maxDistanceKm: 50,
            intents: ["MARRIAGE", "SERIOUS_RELATIONSHIP"],
            languages: [...seedUser.languages]
          }
        },
        verifications: {
          create: [
            {
              type: "EMAIL",
              status: "VERIFIED",
              provider: "mock"
            }
          ]
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "seed.profile.created",
        entity: "Profile",
        entityId: profile.id
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
