import bcrypt from "bcrypt";

const password = "Anil@DealFlow2026!";
const SALT_ROUNDS = 12;

async function generateHash() {
  try {
    console.log("Generating hash for password:", password);
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    console.log("\n✅ Hash Generated Successfully:");
    console.log(hash);
    console.log("\nAdd this to lib/auth.ts DEMO_CUSTOMERS!");
  } catch (err) {
    console.error("Error generating hash:", err);
  }
}

generateHash();
