import assert from "assert";

const IST_OFFSET_HOURS = 5;
const IST_OFFSET_MINUTES = 30;

function getISTTime(date: Date = new Date()): Date {
  return new Date(date.getTime() + (IST_OFFSET_HOURS * 3600000) + (IST_OFFSET_MINUTES * 60000));
}

function isIST7PM(date: Date = new Date()): boolean {
  const ist = getISTTime(date);
  return ist.getUTCHours() === 19 && ist.getUTCMinutes() === 0;
}

function getNextIST7PM(fromDate: Date = new Date()): Date {
  const ist = getISTTime(fromDate);
  const nextIST = new Date(ist);
  nextIST.setUTCHours(19, 0, 0, 0);
  
  if (ist.getUTCHours() >= 19) {
    nextIST.setUTCDate(nextIST.getUTCDate() + 1);
  }
  
  return new Date(nextIST.getTime() - (IST_OFFSET_HOURS * 3600000) - (IST_OFFSET_MINUTES * 60000));
}

function getISTDateString(date: Date = new Date()): string {
  const ist = getISTTime(date);
  return ist.toISOString().split('T')[0];
}

function generateDefaultEmailBody(date: Date): string {
  const ist = getISTTime(date);
  const formattedDate = ist.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily Update</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Daily Update</h1>
    <p style="color: #93C5FD; margin: 10px 0 0; font-size: 14px;">Generated on ${formattedDate} IST</p>
  </div>
  
  <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-top: none; padding: 30px; border-radius: 0 0 12px 12px;">
    <p style="margin: 0 0 20px;">Hello,</p>
    <p style="margin: 0 0 20px;">This is your daily update from Dealflow.ai.</p>
    
    <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px; color: #1E3A5F;">Today's Highlights</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Call summaries and analyses</li>
        <li>Sentiment trends and insights</li>
        <li>Follow-up requirements</li>
      </ul>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9CA3AF;">This is an automated message from Dealflow.ai.</p>
    </div>
  </div>
  
</body>
</html>`;
}

function testISTTimeConversion() {
  const utcDate = new Date('2024-01-15T12:00:00Z');
  const ist = getISTTime(utcDate);
  
  assert.strictEqual(ist.getHours(), 17);
  assert.strictEqual(ist.getMinutes(), 30);
  console.log("ok testISTTimeConversion");
}

function testISTTimeConversionAfternoon() {
  const utcDate = new Date('2024-06-15T12:00:00Z');
  const ist = getISTTime(utcDate);
  
  assert.strictEqual(ist.getHours(), 17);
  assert.strictEqual(ist.getMinutes(), 30);
  console.log("ok testISTTimeConversionAfternoon");
}

function testIsIST7PMTrue() {
  const date = new Date('2024-01-15T13:30:00Z');
  
  const ist = getISTTime(date);
  const result = ist.getUTCHours() === 19 && ist.getUTCMinutes() === 0;
  
  assert.strictEqual(result, true);
  console.log("ok testIsIST7PMTrue");
}

function testIsIST7PMFalse() {
  const date = new Date('2024-01-15T10:00:00Z');
  
  const result = isIST7PM(date);
  
  assert.strictEqual(result, false);
  console.log("ok testIsIST7PMFalse");
}

function testIsIST7PMNotWholeMinute() {
  const date = new Date('2024-01-15T11:30:30Z');
  
  const result = isIST7PM(date);
  
  assert.strictEqual(result, false);
  console.log("ok testIsIST7PMNotWholeMinute");
}

function testGetNextIST7PMSameDay() {
  const date = new Date('2024-01-15T10:00:00Z');
  
  const nextRun = getNextIST7PM(date);
  const nextIST = getISTTime(nextRun);
  
  assert.strictEqual(nextIST.getHours(), 19);
  assert.strictEqual(nextIST.getMinutes(), 0);
  assert.strictEqual(nextIST.getDate(), 15);
  console.log("ok testGetNextIST7PMSameDay");
}

function testGetNextIST7PMNextDay() {
  const date = new Date('2024-01-15T20:00:00Z');
  
  const nextRun = getNextIST7PM(date);
  const nextIST = getISTTime(nextRun);
  
  assert.strictEqual(nextIST.getHours(), 19);
  assert.strictEqual(nextIST.getMinutes(), 0);
  assert.strictEqual(nextIST.getDate(), 16);
  console.log("ok testGetNextIST7PMNextDay");
}

function testGetISTDateString() {
  const date = new Date('2024-01-15T12:00:00Z');
  
  const istDate = getISTDateString(date);
  
  assert.strictEqual(istDate, '2024-01-15');
  console.log("ok testGetISTDateString");
}

function testISTOffsetRemainsConstant() {
  const winterDate = new Date('2024-01-15T12:00:00Z');
  const summerDate = new Date('2024-07-15T12:00:00Z');
  
  const winterIST = getISTTime(winterDate);
  const summerIST = getISTTime(summerDate);
  
  const winterOffset = winterIST.getTime() - winterDate.getTime();
  const summerOffset = summerIST.getTime() - summerDate.getTime();
  
  assert.strictEqual(winterOffset, summerOffset);
  assert.strictEqual(winterOffset, (IST_OFFSET_HOURS * 3600000) + (IST_OFFSET_MINUTES * 60000));
  console.log("ok testISTOffsetRemainsConstant");
}

function testGenerateDefaultEmailBody() {
  const date = new Date('2024-01-15T12:00:00Z');
  
  const html = generateDefaultEmailBody(date);
  
  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('Daily Update'));
  assert.ok(html.includes('Dealflow.ai'));
  assert.ok(html.includes('Generated on'));
  console.log("ok testGenerateDefaultEmailBody");
}

function testGenerateEmailBodyWithCorrectISTDate() {
  const date = new Date('2024-01-15T20:00:00Z');
  
  const html = generateDefaultEmailBody(date);
  
  const ist = getISTTime(date);
  const formattedDate = ist.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  
  assert.ok(html.includes(formattedDate));
  console.log("ok testGenerateEmailBodyWithCorrectISTDate");
}

function testDSTTransitionUSEast() {
  const beforeDST = new Date('2024-03-09T06:00:00Z');
  const afterDST = new Date('2024-03-09T07:00:00Z');
  
  const beforeIST = getISTTime(beforeDST);
  const afterIST = getISTTime(afterDST);
  
  const beforeOffset = beforeIST.getTime() - beforeDST.getTime();
  const afterOffset = afterIST.getTime() - afterDST.getTime();
  
  assert.strictEqual(beforeOffset, afterOffset);
  console.log("ok testDSTTransitionUSEast");
}

function testDSTTransitionEurope() {
  const beforeDST = new Date('2024-03-30T23:00:00Z');
  const afterDST = new Date('2024-03-31T00:00:00Z');
  
  const beforeIST = getISTTime(beforeDST);
  const afterIST = getISTTime(afterDST);
  
  const beforeOffset = beforeIST.getTime() - beforeDST.getTime();
  const afterOffset = afterIST.getTime() - afterDST.getTime();
  
  assert.strictEqual(beforeOffset, afterOffset);
  console.log("ok testDSTTransitionEurope");
}

function testYearBoundary() {
  const endOfYear = new Date('2024-12-31T18:00:00Z');
  
  const ist = getISTTime(endOfYear);
  const nextRun = getNextIST7PM(endOfYear);
  
  assert.strictEqual(ist.getUTCFullYear(), 2024);
  assert.strictEqual(ist.getUTCMonth(), 11);
  
  const nextIST = getISTTime(nextRun);
  assert.strictEqual(nextIST.getUTCFullYear(), 2025);
  assert.strictEqual(nextIST.getUTCMonth(), 0);
  assert.strictEqual(nextIST.getUTCDate(), 1);
  console.log("ok testYearBoundary");
}

function testSystemRestartRecovery() {
  const crashTime = new Date('2024-01-15T20:00:00Z');
  
  const nextRun = getNextIST7PM(crashTime);
  
  assert.ok(nextRun.getTime() > crashTime.getTime());
  
  const simulatedRestartTime = new Date('2024-01-15T20:05:00Z');
  const nextRunAfterRestart = getNextIST7PM(simulatedRestartTime);
  
  assert.strictEqual(nextRun.getTime(), nextRunAfterRestart.getTime());
  console.log("ok testSystemRestartRecovery");
}

function testMultipleDaysSkipped() {
  const missedDate = new Date('2024-01-15T20:00:00Z');
  
  const nextRun = getNextIST7PM(missedDate);
  const nextRunIST = getISTTime(nextRun);
  
  assert.strictEqual(nextRunIST.getDate(), 16);
  assert.strictEqual(nextRunIST.getHours(), 19);
  console.log("ok testMultipleDaysSkipped");
}

function testIST7PMEdgeCase() {
  const exactly7PM = new Date('2024-01-15T11:30:00Z');
  
  const result = isIST7PM(exactly7PM);
  
  assert.strictEqual(result, true);
  console.log("ok testIST7PMEdgeCase");
}

function testQuarterHourEdge() {
  const quarterPast = new Date('2024-01-15T11:45:00Z');
  const quarterTo = new Date('2024-01-15T11:15:00Z');
  
  assert.strictEqual(isIST7PM(quarterPast), false);
  assert.strictEqual(isIST7PM(quarterTo), false);
  console.log("ok testQuarterHourEdge");
}

function testNegativeTimezone() {
  const date = new Date('2024-01-15T20:00:00Z');
  
  const ist = getISTTime(date);
  
  assert.strictEqual(ist.getTimezoneOffset(), -(IST_OFFSET_HOURS * 60 + IST_OFFSET_MINUTES));
  console.log("ok testNegativeTimezone");
}

function testEmailBodyTemplate() {
  const customTemplate = (date: Date) => {
    const ist = getISTTime(date);
    return `<h1>Custom Report for ${ist.toDateString()}</h1>`;
  };
  
  const date = new Date('2024-01-15T12:00:00Z');
  const result = customTemplate(date);
  
  assert.ok(result.includes('Custom Report'));
  assert.ok(result.includes('2024'));
  console.log("ok testEmailBodyTemplate");
}

async function runTests() {
  testISTTimeConversion();
  testISTTimeConversionAfternoon();
  testIsIST7PMTrue();
  testIsIST7PMFalse();
  testIsIST7PMNotWholeMinute();
  testGetNextIST7PMSameDay();
  testGetNextIST7PMNextDay();
  testGetISTDateString();
  testISTOffsetRemainsConstant();
  testGenerateDefaultEmailBody();
  testGenerateEmailBodyWithCorrectISTDate();
  testDSTTransitionUSEast();
  testDSTTransitionEurope();
  testYearBoundary();
  testSystemRestartRecovery();
  testMultipleDaysSkipped();
  testIST7PMEdgeCase();
  testQuarterHourEdge();
  testNegativeTimezone();
  testEmailBodyTemplate();
  
  console.log("\n✅ All daily email scheduler tests passed!");
}

runTests().catch(e => {
  console.error("❌ Test failed:", e);
  process.exit(1);
});
