import assert from "assert";
import { applyVeritasTrustLayer } from "../lib/veritas";
import { PERSONAS } from "../prompts/personas";
import { AgentAction } from "../lib/agent-brain";

async function testVeritasLengthConstraint() {
  const persona = PERSONAS.alex;
  const companyContext = { companyName: "Acme Corp" };
  const action: AgentAction = {
    action: "speak",
    content: "One. Two. Three. Four. Five. Six.",
    stage_update: "discovery",
    buyingSignal: false,
    objectionDetected: false,
    dealProbability: 50
  };

  const result = await applyVeritasTrustLayer(action, companyContext, persona, []);
  const sentences = result.action.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  assert.ok(result.isModified);
  assert.equal(sentences.length, 4);
  assert.ok(result.trustScore < 100);
  console.log("ok testVeritasLengthConstraint");
}

async function testVeritasHallucinationCheck() {
  const persona = PERSONAS.alex;
  const companyContext = { companyName: "Acme Corp" };
  const action: AgentAction = {
    action: "speak",
    content: "I'm excited to talk about your challenges today. How can I help?",
    stage_update: "discovery",
    buyingSignal: false,
    objectionDetected: false,
    dealProbability: 50
  };

  const result = await applyVeritasTrustLayer(action, companyContext, persona, []);
  assert.ok(result.warnings.some(w => w.includes("Missing mention of client company")));
  console.log("ok testVeritasHallucinationCheck");
}

async function testVeritasAiIndicatorRemoval() {
  const persona = PERSONAS.alex;
  const companyContext = { companyName: "Acme Corp" };
  const action: AgentAction = {
    action: "speak",
    content: "As an AI language model, I can help Acme Corp with that. [insert details here].",
    stage_update: "discovery",
    buyingSignal: false,
    objectionDetected: false,
    dealProbability: 50
  };

  const result = await applyVeritasTrustLayer(action, companyContext, persona, []);
  assert.ok(result.isModified);
  assert.ok(!result.action.content.toLowerCase().includes("as an ai"));
  assert.ok(!result.action.content.includes("[insert"));
  console.log("ok testVeritasAiIndicatorRemoval");
}

async function testVeritasPraneethGrounding() {
  const persona = PERSONAS.praneeth_assist;
  const companyContext = { companyName: "Acme Corp" };
  const action: AgentAction = {
    action: "speak",
    content: "Acme Corp is doing great. We should partner together.",
    stage_update: "discovery",
    buyingSignal: false,
    objectionDetected: false,
    dealProbability: 50
  };

  const result = await applyVeritasTrustLayer(action, companyContext, persona, []);
  assert.ok(result.warnings.some(w => w.includes("failed to mention 2X impact or ROI")));
  console.log("ok testVeritasPraneethGrounding");
}

async function runTests() {
  await testVeritasLengthConstraint();
  await testVeritasHallucinationCheck();
  await testVeritasAiIndicatorRemoval();
  await testVeritasPraneethGrounding();
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
