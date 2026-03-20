import { PrismaClient, Role } from "@prisma/client";

import {
  ALL_CLASS_NAMES,
  DEFAULT_MODERATOR_LOGIN,
  DEFAULT_MODERATOR_NAME,
  DEFAULT_MODERATOR_PASSWORD,
  DEFAULT_SUBJECTS,
} from "../src/lib/constants";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  for (const className of ALL_CLASS_NAMES) {
    await prisma.class.upsert({
      where: { name: className },
      update: {},
      create: { name: className },
    });
  }

  for (const subjectName of DEFAULT_SUBJECTS) {
    await prisma.subject.upsert({
      where: { name: subjectName },
      update: {},
      create: { name: subjectName },
    });
  }

  const moderatorPasswordHash = await hashPassword(DEFAULT_MODERATOR_PASSWORD);

  await prisma.user.upsert({
    where: { login: DEFAULT_MODERATOR_LOGIN },
    update: {
      fullName: DEFAULT_MODERATOR_NAME,
      passwordHash: moderatorPasswordHash,
      role: Role.MODERATOR,
    },
    create: {
      fullName: DEFAULT_MODERATOR_NAME,
      login: DEFAULT_MODERATOR_LOGIN,
      passwordHash: moderatorPasswordHash,
      role: Role.MODERATOR,
    },
  });
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
