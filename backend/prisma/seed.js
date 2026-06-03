import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed démarré...");

  const email = "admin@gmail.com";
  const password = "Admin111@";

  // 1. Vérifier si admin existe déjà (règle métier)
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "admin" },
  });

  if (existingAdmin) {
    console.log("Un admin existe déjà, seed ignoré.");
    return;
  }

  // 2. Vérifier email (optionnel mais propre)
  const emailExists = await prisma.user.findUnique({
    where: { email },
  });

  if (emailExists) {
    console.log("Email déjà utilisé, seed ignoré.");
    return;
  }

  // 3. hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. création admin
  await prisma.user.create({
    data: {
      nom: "ADMIN",
      prenom: "Admin",
      email,
      password: hashedPassword,
      role: "admin",
      firstLogin: true,
    },
  });

  console.log("Admin créé avec succès :", email);
}

main()
  .catch((e) => {
    console.error("Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });