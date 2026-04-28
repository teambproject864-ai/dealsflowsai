import assert from "assert";
import { encryptAES, decryptAES, encryptXChaCha20, decryptXChaCha20, generateAuditHash } from "../lib/security";
import { randomBytes } from "crypto";

async function testAES() {
  const key = randomBytes(32);
  const data = "Sensitive meeting data for Acme Corp";
  const encrypted = encryptAES(data, key);
  const decrypted = decryptAES(encrypted, key);
  
  assert.equal(decrypted, data);
  assert.ok(encrypted.includes(":")); // iv:authTag:encrypted
  console.log("ok testAES");
}

async function testXChaCha20() {
  const key = new Uint8Array(32).fill(1); // Mock key
  const data = "Long-term data at rest";
  const encrypted = await encryptXChaCha20(data, key);
  const decrypted = await decryptXChaCha20(encrypted, key);
  
  assert.equal(decrypted, data);
  assert.ok(encrypted.length > data.length);
  console.log("ok testXChaCha20");
}

async function testAuditIntegrity() {
  const payload = { action: "speak", content: "Hello" };
  const hash1 = generateAuditHash(payload);
  const hash2 = generateAuditHash(payload);
  const hash3 = generateAuditHash({ ...payload, content: "Modified" });
  
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hash3);
  console.log("ok testAuditIntegrity");
}

async function runTests() {
  await testAES();
  await testXChaCha20();
  await testAuditIntegrity();
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
