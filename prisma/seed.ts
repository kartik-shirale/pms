// Seed admin user using better-auth
import "dotenv/config";

// Mock server-only to allow imports in Node scripts
const Module = require("module");
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id: string) {
  if (id === "server-only") {
    return {}; // Mock server-only module
  }
  return originalRequire.apply(this, arguments);
};

async function main() {
  console.log("🌱 Seeding admin user...");

  const adminEmail = "aryanshirale1230@gmail.com";
  const adminPassword = "ctbm634uf9";
  const adminName = "Admin User";

  // Dynamically import after mocking server-only
  const { auth } = await import("../src/lib/auth/auth");
  const { default: prisma } = await import("../src/lib/prisma");

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log("✅ Admin user already exists!");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   ID: ${existingUser.id}`);

      // Update user to ensure admin role and full power
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: "admin",
          power: "full",
        },
      });

      console.log(`   Role: ${updatedUser.role}`);
      console.log(`   Power: ${updatedUser.power}`);
      console.log("\n🎉 Admin user updated with admin role and full power!");
    } else {
      // Create new admin user using better-auth API
      const result = await auth.api.signUpEmail({
        body: {
          name: adminName,
          email: adminEmail,
          password: adminPassword,
        },
      });

      if (!result.user) {
        console.error("❌ Failed to create admin user");
        throw new Error("Sign up failed");
      }

      // Update user with admin role and full power
      const updatedUser = await prisma.user.update({
        where: { id: result.user.id },
        data: {
          role: "admin",
          power: "full",
        },
      });

      console.log("✅ Admin user created successfully!");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   ID: ${updatedUser.id}`);
      console.log(`   Role: ${updatedUser.role}`);
      console.log(`   Power: ${updatedUser.power}`);
      console.log("\n✨ User account and credentials created via better-auth!");
      console.log(
        "🎉 User can now sign in at /sign-in with full admin access!",
      );
    }

    await prisma.$disconnect();
  } catch (error: any) {
    if (
      error.message?.includes("already exists") ||
      error.message?.includes("unique constraint")
    ) {
      console.log("\n⚠️  User already exists in database");
      console.log("   Updating role and power...");

      const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      if (existingUser) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: "admin",
            power: "full",
          },
        });
        console.log("✅ Role and power updated!");
      }
      await prisma.$disconnect();
    } else {
      console.error("\n❌ Error creating/updating admin user:");
      console.error(error);
      await prisma.$disconnect();
      throw error;
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
