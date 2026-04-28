import assert from "assert";

const POSITIVE_KEYWORDS = [
  'great', 'excellent', 'amazing', 'love', 'perfect', 'fantastic', 'wonderful',
  'interested', 'excited', 'impressed', 'helpful', 'valuable', 'awesome',
  'brilliant', 'outstanding', 'superb', 'terrific', 'best', 'good', 'yes'
];

const NEGATIVE_KEYWORDS = [
  'bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointed', 'frustrated',
  'angry', 'upset', 'concerned', 'worried', 'difficult', 'problem', 'issue',
  'wrong', 'hate', 'dislike', 'complaint', 'fail', 'failure', 'cannot', "can't",
  "won't", 'never', 'disappointed', 'confused', 'unclear', 'expensive', 'slow'
];

const DRAWBACK_PATTERNS = [
  /price|cost|expensive|budget/i,
  /complex|complicated|difficult|hard/i,
  /integration|connect|compatibility/i,
  /support|customer service|response/i,
  /feature|missing|lack|need/i,
  /security|compliance|privacy/i,
  /training|learning curve/i
];

const IMPROVEMENT_PATTERNS = [
  /could improve|should improve|would be better|would help/i,
  /wish|would like|hope|ideally/i,
  /consider|recommend|suggest/i
];

const CONCERN_PATTERNS = [
  /worried|concern|anxious|fear/i,
  /uncertain|unsure|doubt|hesitat/i,
  /nervous|apprehensive|reluctant/i
];

const FOLLOW_UP_PATTERNS = [
  /will send|will provide|will schedule|will follow up/i,
  /send|provide|schedule|contact|reach out|call|email/i,
  /by monday|by friday|by next week|by end of/i,
  /follow up|follow-up|get back|touch base/i
];

const KEY_DISCUSSION_PATTERNS = [
  /discussed?|talked about|reviewed|covered|addressed/i,
  /key point|important|noted|remember|main/i,
  /agreed|decided|concluded|summary/i
];

interface SentimentResult {
  rating: 'Positive' | 'Neutral' | 'Negative';
  score: number;
  positiveKeywords: string[];
  negativeKeywords: string[];
}

function analyzeSentiment(text: string): SentimentResult {
  if (!text || text.trim().length === 0) {
    return { rating: 'Neutral', score: 0, positiveKeywords: [], negativeKeywords: [] };
  }

  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  const foundPositive: string[] = [];
  const foundNegative: string[] = [];

  for (const keyword of POSITIVE_KEYWORDS) {
    if (text.toLowerCase().includes(keyword)) {
      score += 1;
      foundPositive.push(keyword);
    }
  }

  for (const keyword of NEGATIVE_KEYWORDS) {
    if (text.toLowerCase().includes(keyword)) {
      score -= 1;
      foundNegative.push(keyword);
    }
  }

  let rating: 'Positive' | 'Neutral' | 'Negative';
  if (score > 0) rating = 'Positive';
  else if (score < 0) rating = 'Negative';
  else rating = 'Neutral';

  return { rating, score, positiveKeywords: foundPositive, negativeKeywords: foundNegative };
}

function extractDrawbacks(text: string): string[] {
  const drawbacks: string[] = [];
  for (const pattern of DRAWBACK_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const sentence = text.slice(Math.max(0, text.indexOf(match[0]) - 50), text.indexOf(match[0]) + match[0].length + 50);
      const cleanSentence = sentence.replace(/[.!?]+$/, '').trim();
      if (cleanSentence && !drawbacks.includes(cleanSentence)) {
        drawbacks.push(cleanSentence);
      }
    }
  }
  return drawbacks;
}

function extractImprovements(text: string): string[] {
  const improvements: string[] = [];
  for (const pattern of IMPROVEMENT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const sentence = text.slice(Math.max(0, text.indexOf(match[0]) - 50), text.indexOf(match[0]) + match[0].length + 50);
      const cleanSentence = sentence.replace(/[.!?]+$/, '').trim();
      if (cleanSentence && !improvements.includes(cleanSentence)) {
        improvements.push(cleanSentence);
      }
    }
  }
  return improvements;
}

function extractCustomerConcerns(text: string): string[] {
  const concerns: string[] = [];
  for (const pattern of CONCERN_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const sentence = text.slice(Math.max(0, text.indexOf(match[0]) - 50), text.indexOf(match[0]) + match[0].length + 50);
      const cleanSentence = sentence.replace(/[.!?]+$/, '').trim();
      if (cleanSentence && !concerns.includes(cleanSentence)) {
        concerns.push(cleanSentence);
      }
    }
  }
  return concerns;
}

function extractFollowUpRequirements(text: string): string[] {
  const followUps: string[] = [];
  for (const pattern of FOLLOW_UP_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const sentence = text.slice(Math.max(0, text.indexOf(match[0]) - 50), text.indexOf(match[0]) + match[0].length + 50);
      const cleanSentence = sentence.replace(/[.!?]+$/, '').trim();
      if (cleanSentence && !followUps.includes(cleanSentence)) {
        followUps.push(cleanSentence);
      }
    }
  }
  return followUps;
}

function extractKeyDiscussionPoints(text: string): string[] {
  const points: string[] = [];
  for (const pattern of KEY_DISCUSSION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const sentence = text.slice(Math.max(0, text.indexOf(match[0]) - 50), text.indexOf(match[0]) + match[0].length + 50);
      const cleanSentence = sentence.replace(/[.!?]+$/, '').trim();
      if (cleanSentence && !points.includes(cleanSentence)) {
        points.push(cleanSentence);
      }
    }
  }
  return points;
}

interface PostCallAnalysis {
  callId: string;
  companyName: string;
  contactName: string;
  sentiment: SentimentResult;
  drawbacks: string[];
  improvements: string[];
  keyDiscussionPoints: string[];
  customerConcerns: string[];
  followUpRequirements: string[];
  overallSummary: string;
}

function generatePostCallAnalysis(
  callId: string,
  transcriptText: string,
  companyName: string,
  contactName: string
): PostCallAnalysis {
  const sentiment = analyzeSentiment(transcriptText);
  const drawbacks = extractDrawbacks(transcriptText);
  const improvements = extractImprovements(transcriptText);
  const keyDiscussionPoints = extractKeyDiscussionPoints(transcriptText);
  const customerConcerns = extractCustomerConcerns(transcriptText);
  const followUpRequirements = extractFollowUpRequirements(transcriptText);

  const overallSummary = `This call with ${contactName} from ${companyName} was analyzed with a ${sentiment.rating.toLowerCase()} sentiment (score: ${sentiment.score}). ${drawbacks.length} drawbacks and ${improvements.length} areas for improvement were identified. ${keyDiscussionPoints.length} key discussion points were noted. ${customerConcerns.length} customer concerns were raised. ${followUpRequirements.length} follow-up items require action.`;

  return {
    callId,
    companyName,
    contactName,
    sentiment,
    drawbacks,
    improvements,
    keyDiscussionPoints,
    customerConcerns,
    followUpRequirements,
    overallSummary
  };
}

function generateProfessionalEmail(analysis: PostCallAnalysis): string {
  const sentimentColor = analysis.sentiment.rating === 'Positive' ? '#10B981' : analysis.sentiment.rating === 'Negative' ? '#EF4444' : '#6B7280';
  const sentimentBg = analysis.sentiment.rating === 'Positive' ? '#D1FAE5' : analysis.sentiment.rating === 'Negative' ? '#FEE2E2' : '#F3F4F6';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Post-Call Analysis Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; max-width: 800px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Post-Call Analysis Report</h1>
    <p style="color: #93C5FD; margin: 10px 0 0; font-size: 14px;">Generated by ALMA Trust Layer</p>
  </div>
  
  <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-top: none; padding: 30px; border-radius: 0 0 12px 12px;">
    
    <div style="background: ${sentimentBg}; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px;">Overall Sentiment</p>
      <p style="margin: 5px 0 0; font-size: 28px; font-weight: 700; color: ${sentimentColor};">${analysis.sentiment.rating}</p>
      <p style="margin: 5px 0 0; font-size: 14px; color: #6B7280;">Score: ${analysis.sentiment.score}</p>
    </div>
    
    <div style="margin-bottom: 25px;">
      <h2 style="font-size: 18px; font-weight: 600; color: #1E3A5F; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin: 0 0 15px;">Call Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6B7280; width: 140px;">Call ID:</td>
          <td style="padding: 8px 0; font-weight: 500;">${analysis.callId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Company:</td>
          <td style="padding: 8px 0; font-weight: 500;">${analysis.companyName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Contact:</td>
          <td style="padding: 8px 0; font-weight: 500;">${analysis.contactName}</td>
        </tr>
      </table>
    </div>
    
    ${analysis.drawbacks.length > 0 ? `
    <div style="margin-bottom: 25px;">
      <h2 style="font-size: 18px; font-weight: 600; color: #1E3A5F; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin: 0 0 15px;">Key Drawbacks & Issues</h2>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${analysis.drawbacks.map(d => `<li style="padding: 10px 15px; background: #FEF2F2; border-left: 3px solid #EF4444; margin-bottom: 8px; border-radius: 0 4px 4px 0;">${d}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    ${analysis.improvements.length > 0 ? `
    <div style="margin-bottom: 25px;">
      <h2 style="font-size: 18px; font-weight: 600; color: #1E3A5F; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin: 0 0 15px;">Areas for Improvement</h2>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${analysis.improvements.map(i => `<li style="padding: 10px 15px; background: #FFF7ED; border-left: 3px solid #F97316; margin-bottom: 8px; border-radius: 0 4px 4px 0;">${i}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    ${analysis.keyDiscussionPoints.length > 0 ? `
    <div style="margin-bottom: 25px;">
      <h2 style="font-size: 18px; font-weight: 600; color: #1E3A5F; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin: 0 0 15px;">Key Discussion Points</h2>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${analysis.keyDiscussionPoints.map(p => `<li style="padding: 10px 15px; background: #EFF6FF; border-left: 3px solid #3B82F6; margin-bottom: 8px; border-radius: 0 4px 4px 0;">${p}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    ${analysis.customerConcerns.length > 0 ? `
    <div style="margin-bottom: 25px;">
      <h2 style="font-size: 18px; font-weight: 600; color: #1E3A5F; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin: 0 0 15px;">Customer Concerns</h2>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${analysis.customerConcerns.map(c => `<li style="padding: 10px 15px; background: #FEF9C3; border-left: 3px solid #EAB308; margin-bottom: 8px; border-radius: 0 4px 4px 0;">${c}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    ${analysis.followUpRequirements.length > 0 ? `
    <div style="margin-bottom: 25px;">
      <h2 style="font-size: 18px; font-weight: 600; color: #1E3A5F; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin: 0 0 15px;">Follow-Up Requirements</h2>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${analysis.followUpRequirements.map(f => `<li style="padding: 10px 15px; background: #F0FDF4; border-left: 3px solid #22C55E; margin-bottom: 8px; border-radius: 0 4px 4px 0;">${f}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-top: 30px;">
      <h2 style="font-size: 18px; font-weight: 600; color: #1E3A5F; margin: 0 0 10px;">Overall Summary</h2>
      <p style="margin: 0; color: #4B5563;">${analysis.overallSummary}</p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9CA3AF;">This report was automatically generated by the ALMA Trust Layer system. For questions or concerns, please contact your system administrator.</p>
    </div>
  </div>
  
</body>
</html>`;
}

async function testSentimentPositive() {
  const text = "This was great! We love the product and are excited to move forward. The demo was amazing and the team was very helpful.";
  const result = analyzeSentiment(text);
  
  assert.strictEqual(result.rating, 'Positive');
  assert.ok(result.score > 0);
  assert.ok(result.positiveKeywords.length > 0);
  console.log("ok testSentimentPositive");
}

async function testSentimentNegative() {
  const text = "This was terrible. We are disappointed with the product. The support is awful and we have many concerns about the pricing.";
  const result = analyzeSentiment(text);
  
  assert.strictEqual(result.rating, 'Negative');
  assert.ok(result.score < 0);
  assert.ok(result.negativeKeywords.length > 0);
  console.log("ok testSentimentNegative");
}

async function testSentimentNeutral() {
  const text = "We discussed the product features today. The meeting was scheduled for 30 minutes. We talked about integration options and timeline.";
  const result = analyzeSentiment(text);
  
  assert.strictEqual(result.rating, 'Neutral');
  console.log("ok testSentimentNeutral");
}

async function testExtractDrawbacks() {
  const text = "The main issue is the price is too expensive for our budget. We also have concerns about integration complexity and the learning curve for training.";
  const drawbacks = extractDrawbacks(text);
  
  assert.ok(drawbacks.length > 0);
  assert.ok(drawbacks.some(d => d.toLowerCase().includes('price') || d.toLowerCase().includes('expensive')));
  console.log("ok testExtractDrawbacks");
}

async function testExtractImprovements() {
  const text = "We could improve the dashboard. It would be better if they could add more integrations. We wish the reporting was easier.";
  const improvements = extractImprovements(text);
  
  assert.ok(improvements.length > 0);
  console.log("ok testExtractImprovements");
}

async function testExtractCustomerConcerns() {
  const text = "We are worried about the security compliance. The client is concerned about data privacy. They seem anxious about the migration timeline.";
  const concerns = extractCustomerConcerns(text);
  
  assert.ok(concerns.length > 0);
  assert.ok(concerns.some(c => c.toLowerCase().includes('worried') || c.toLowerCase().includes('concern')));
  console.log("ok testExtractCustomerConcerns");
}

async function testExtractFollowUpRequirements() {
  const text = "We will send the proposal by Monday. The client needs the pricing breakdown by Friday. Follow up next week to schedule the demo.";
  const followUps = extractFollowUpRequirements(text);
  
  assert.ok(followUps.length > 0);
  assert.ok(followUps.some(f => f.toLowerCase().includes('send') || f.toLowerCase().includes('friday') || f.toLowerCase().includes('follow')));
  console.log("ok testExtractFollowUpRequirements");
}

async function testExtractKeyDiscussionPoints() {
  const text = "We discussed the timeline and talked about the budget constraints. The key point is that they need compliance certification. We agreed to have a follow-up meeting.";
  const points = extractKeyDiscussionPoints(text);
  
  assert.ok(points.length > 0);
  console.log("ok testExtractKeyDiscussionPoints");
}

async function testGeneratePostCallAnalysis() {
  const text = "Great meeting today! We love the product and are excited. The main concern is the price is expensive. We discussed integration needs. Follow up next week.";
  
  const analysis = generatePostCallAnalysis(
    "test-call-123",
    text,
    "Acme Corp",
    "John Doe"
  );
  
  assert.strictEqual(analysis.callId, "test-call-123");
  assert.strictEqual(analysis.companyName, "Acme Corp");
  assert.strictEqual(analysis.contactName, "John Doe");
  assert.ok(['Positive', 'Neutral', 'Negative'].includes(analysis.sentiment.rating));
  assert.ok(analysis.drawbacks.length > 0 || analysis.improvements.length > 0);
  assert.ok(analysis.followUpRequirements.length > 0);
  console.log("ok testGeneratePostCallAnalysis");
}

async function testGenerateProfessionalEmail() {
  const analysis: PostCallAnalysis = {
    callId: "test-call-456",
    companyName: "TechCorp",
    contactName: "Jane Smith",
    sentiment: {
      rating: 'Positive',
      score: 75,
      positiveKeywords: ['great', 'love', 'excited'],
      negativeKeywords: []
    },
    drawbacks: ['Price is on the higher side'],
    improvements: ['Could improve mobile app'],
    keyDiscussionPoints: ['Discussed ROI projections', 'Reviewed integration options'],
    customerConcerns: ['Worried about migration timeline'],
    followUpRequirements: ['Will send proposal by Monday', 'Follow up next Friday'],
    overallSummary: 'This was a highly positive meeting with TechCorp.'
  };
  
  const emailHtml = generateProfessionalEmail(analysis);
  
  assert.ok(emailHtml.includes('TechCorp'));
  assert.ok(emailHtml.includes('Jane Smith'));
  assert.ok(emailHtml.includes('Positive'));
  assert.ok(emailHtml.includes('75'));
  assert.ok(emailHtml.includes('Post-Call Analysis Report'));
  assert.ok(emailHtml.includes('<!DOCTYPE html>'));
  console.log("ok testGenerateProfessionalEmail");
}

async function testSentimentWithMixedSignals() {
  const text = "We love the features but the price is a concern. The demo was great but we are worried about support response times. Interested but need to discuss budget.";
  const result = analyzeSentiment(text);
  
  assert.ok(['Positive', 'Neutral', 'Negative'].includes(result.rating));
  assert.ok(result.positiveKeywords.length > 0);
  assert.ok(result.negativeKeywords.length > 0);
  console.log("ok testSentimentWithMixedSignals");
}

async function testEmptyTranscript() {
  const text = "";
  const result = analyzeSentiment(text);
  
  assert.strictEqual(result.rating, 'Neutral');
  assert.strictEqual(result.score, 0);
  assert.deepStrictEqual(result.positiveKeywords, []);
  assert.deepStrictEqual(result.negativeKeywords, []);
  console.log("ok testEmptyTranscript");
}

async function runTests() {
  await testSentimentPositive();
  await testSentimentNegative();
  await testSentimentNeutral();
  await testExtractDrawbacks();
  await testExtractImprovements();
  await testExtractCustomerConcerns();
  await testExtractFollowUpRequirements();
  await testExtractKeyDiscussionPoints();
  await testGeneratePostCallAnalysis();
  await testGenerateProfessionalEmail();
  await testSentimentWithMixedSignals();
  await testEmptyTranscript();
  
  console.log("\n✅ All post-call email tests passed!");
}

runTests().catch(e => {
  console.error("❌ Test failed:", e);
  process.exit(1);
});
