// Google Apps Script for Project Evaluation System
// Deploy as Web App with "Anyone, even anonymous" access

// Configuration - Auto-create spreadsheet if not exists
let EVALUATION_SPREADSHEET_ID = 'YOUR_EVALUATION_SPREADSHEET_ID_HERE'; // Will be auto-created
const EVALUATION_SHEET_NAME = 'EvaluationResponses';
const SUMMARY_SHEET_NAME = 'EvaluationSummary';

// Auto-create spreadsheet if needed
function getOrCreateSpreadsheet() {
  try {
    if (EVALUATION_SPREADSHEET_ID === 'YOUR_EVALUATION_SPREADSHEET_ID_HERE') {
      // Create new spreadsheet in the same Google Drive as the script
      console.log('Creating new spreadsheet...');
      const spreadsheet = SpreadsheetApp.create('Project Evaluation Data - ' + new Date().toISOString().split('T')[0]);
      EVALUATION_SPREADSHEET_ID = spreadsheet.getId();
      console.log('✅ Created new spreadsheet with ID:', EVALUATION_SPREADSHEET_ID);
      console.log('Spreadsheet URL:', spreadsheet.getUrl());
      return spreadsheet;
    } else {
      console.log('Opening existing spreadsheet:', EVALUATION_SPREADSHEET_ID);
      return SpreadsheetApp.openById(EVALUATION_SPREADSHEET_ID);
    }
  } catch (error) {
    console.error('❌ Error with spreadsheet:', error);
    // Fallback: create new spreadsheet
    console.log('Creating fallback spreadsheet...');
    const spreadsheet = SpreadsheetApp.create('Project Evaluation Data - Fallback - ' + new Date().toISOString().split('T')[0]);
    console.log('✅ Fallback spreadsheet created with ID:', spreadsheet.getId());
    console.log('Fallback spreadsheet URL:', spreadsheet.getUrl());
    return spreadsheet;
  }
}

function doGet(e) {
  try {
    console.log('=== EVALUATION GET REQUEST ===');
    console.log('Parameters:', e.parameter);
    
    const action = e.parameter.action;
    console.log('GET Action:', action);
    
    let result;
    
    if (action === 'submitEvaluation') {
      // Handle evaluation submission via GET request
      console.log('Processing evaluation submission via GET...');
      result = handleEvaluationSubmission(e.parameter);
    } else if (action === 'getEvaluationStats') {
      result = getEvaluationStatistics();
    } else {
      result = { success: false, error: 'Unknown action: ' + action };
    }
    
    console.log('GET Result:', result);
    
    // Return JSON response with CORS headers
    const output = ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
    // Set CORS headers for GET requests
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return output;
      
  } catch (error) {
    console.error('GET Error:', error);
    const errorOutput = ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
    // Set CORS headers for GET error response too
    errorOutput.setHeader('Access-Control-Allow-Origin', '*');
    errorOutput.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    errorOutput.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return errorOutput;
  }
}

function doPost(e) {
  try {
    console.log('=== EVALUATION FORM SUBMISSION ===');
    console.log('Received POST request:', e.postData);
    console.log('Parameters:', e.parameter);
    
    let data;
    let action;
    
    // Handle different content types
    if (e.postData && e.postData.type === 'application/json') {
      console.log('Processing JSON data...');
      const jsonData = JSON.parse(e.postData.contents);
      action = jsonData.action;
      data = jsonData.data;
    } else {
      console.log('Processing form data...');
      // Form data - extract all parameters
      action = e.parameter.action;
      data = {};
      
      // Copy all form parameters to data object
      for (const key in e.parameter) {
        if (key !== 'action') {
          data[key] = e.parameter[key];
        }
      }
    }
    
    console.log('Action:', action);
    console.log('Data keys:', Object.keys(data || {}));
    console.log('Full data object:', data);
    console.log('Gender:', data?.participantGender);
    console.log('Age:', data?.participantAge);
    
    let result;
    
    switch (action) {
      case 'submitEvaluation':
        result = handleEvaluationSubmission(data);
        break;
      case 'getEvaluationStats':
        result = getEvaluationStatistics();
        break;
      case 'generateReport':
        result = generateEvaluationReport();
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
    
    console.log('Result:', result);
    
    // Add CORS headers to fix 403 error
    const output = ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
    // Set CORS headers
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return output;
      
  } catch (error) {
    console.error('Error in doPost:', error);
    const errorOutput = ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
    // Set CORS headers for error response too
    errorOutput.setHeader('Access-Control-Allow-Origin', '*');
    errorOutput.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    errorOutput.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return errorOutput;
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    let result;
    switch (action) {
      case 'getEvaluationStats':
        result = getEvaluationStatistics();
        break;
      case 'generateReport':
        result = generateEvaluationReport();
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleEvaluationSubmission(data) {
  try {
    console.log('=== HANDLING EVALUATION SUBMISSION ===');
    console.log('Raw data received:', JSON.stringify(data, null, 2));
    
    // Validate data
    if (!data) {
      throw new Error('No data received');
    }
    
    const spreadsheet = getOrCreateSpreadsheet();
    console.log('Spreadsheet ID:', spreadsheet.getId());
    
    let sheet = spreadsheet.getSheetByName(EVALUATION_SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log('Creating new evaluation sheet...');
      sheet = spreadsheet.insertSheet(EVALUATION_SHEET_NAME);
      setupEvaluationHeaders(sheet);
    }
    
    // ใช้ data โดยตรงไม่ต้อง map เพราะ field names ถูกต้องแล้ว
console.log('Using data directly (no mapping needed)');

    // Prepare row data with current timestamp
    const now = new Date();
   
    const rowData = [
      now.toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok' }),
      now.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' }),
      data.participantGender || '',
      data.participantAge || '',
      data.contentSatisfaction || '',
      data.contentDifficulty || '',
      data.contentUsefulness || '',
      data.instructorKnowledge || '',
      data.instructorCommunication || '',
      data.instructorQA || '',
      data.timeDuration || '',
      data.timeSchedule || '',
      data.organizationOverall || '',
      data.platformSatisfaction || '',
      data.avQuality || '',
      data.overallSatisfaction || '',
      data.recommendation || '',
      data.improvements || '',
      data.additionalTopics || '',
      data.otherComments || ''
    ];
    
    console.log('Row data to append:', rowData);
    console.log('Row data length:', rowData.length);
    console.log('Non-empty values:', rowData.filter(val => val !== '').length);
    
    // Log each field for debugging
    const fieldNames = [
      'Submission Time', 'Submission Date', 'Gender', 'Age Group',
      'Content Satisfaction', 'Content Difficulty', 'Content Usefulness',
      'Instructor Knowledge', 'Instructor Communication', 'Instructor Q&A',
      'Time Duration', 'Time Schedule', 'Organization Overall',
      'Platform Satisfaction', 'AV Quality', 'Overall Satisfaction',
      'Recommendation', 'Improvements', 'Additional Topics', 'Other Comments'
    ];
    
    for (let i = 0; i < rowData.length; i++) {
      console.log(`${fieldNames[i]}: "${rowData[i]}"`);
    }
    
    // Add row to sheet
    const lastRow = sheet.getLastRow();
    console.log('Current last row:', lastRow);
    
    sheet.appendRow(rowData);
    console.log('Row appended successfully');
    
    // Verify data was added
    const newLastRow = sheet.getLastRow();
    console.log('New last row:', newLastRow);
    
    if (newLastRow > lastRow) {
      console.log('✅ Data successfully added to sheet');
      
      // Update summary statistics
      try {
        updateEvaluationSummary(spreadsheet);
        console.log('Summary updated');
      } catch (summaryError) {
        console.log('Summary update failed:', summaryError);
      }
      
      return { 
        success: true, 
        message: 'Evaluation submitted successfully',
        rowAdded: newLastRow,
        spreadsheetId: spreadsheet.getId()
      };
    } else {
      throw new Error('Data was not added to sheet');
    }
    
  } catch (error) {
    console.error('❌ Error submitting evaluation:', error);
    return { 
      success: false, 
      error: error.toString(),
      stack: error.stack
    };
  }
}

function setupEvaluationHeaders(sheet) {
  const headers = [
    'Submission Time',
    'Submission Date',
    'Gender',
    'Age Group',
    'Content Satisfaction',
    'Content Difficulty',
    'Content Usefulness',
    'Instructor Knowledge',
    'Instructor Communication',
    'Instructor Q&A',
    'Time Duration',
    'Time Schedule',
    'Organization Overall',
    'Platform Satisfaction',
    'AV Quality',
    'Overall Satisfaction',
    'Recommendation',
    'Improvements',
    'Additional Topics',
    'Other Comments'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#f59e0b');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
}

function updateEvaluationSummary(spreadsheet) {
  try {
    let summarySheet = spreadsheet.getSheetByName(SUMMARY_SHEET_NAME);
    
    if (!summarySheet) {
      summarySheet = spreadsheet.insertSheet(SUMMARY_SHEET_NAME);
      setupSummaryHeaders(summarySheet);
    }
    
    const dataSheet = spreadsheet.getSheetByName(EVALUATION_SHEET_NAME);
    const data = dataSheet.getDataRange().getValues();
    
    if (data.length <= 1) return; // No data to summarize
    
    // Calculate statistics
    const stats = calculateEvaluationStatistics(data);
    
    // Update summary sheet
    updateSummarySheet(summarySheet, stats);
    
  } catch (error) {
    console.error('Error updating summary:', error);
  }
}

function setupSummaryHeaders(sheet) {
  const summaryData = [
    ['Project Evaluation Summary', ''],
    ['Generated:', new Date().toLocaleString('th-TH')],
    ['', ''],
    ['Response Statistics', ''],
    ['Total Responses', '=COUNTA(EvaluationResponses!A:A)-1'],
    ['', ''],
    ['Demographics', ''],
    ['Male Count', '=COUNTIF(EvaluationResponses!C:C,"ชาย")'],
    ['Female Count', '=COUNTIF(EvaluationResponses!C:C,"หญิง")'],
    ['Age 14 or less', '=COUNTIF(EvaluationResponses!D:D,"14 ปี หรือน้อยกว่า")'],
    ['Age 15-17', '=COUNTIF(EvaluationResponses!D:D,"15-17 ปี")'],
    ['Age 18-22', '=COUNTIF(EvaluationResponses!D:D,"18-22 ปี")'],
    ['Age 23-30', '=COUNTIF(EvaluationResponses!D:D,"23-30 ปี")'],
    ['Age 31-50', '=COUNTIF(EvaluationResponses!D:D,"31-50 ปี")'],
    ['Age 50-60', '=COUNTIF(EvaluationResponses!D:D,"50-60 ปี")'],
    ['Age 60+', '=COUNTIF(EvaluationResponses!D:D,"60 ปีขึ้นไป")'],
    ['', ''],
    ['Average Ratings (1-5 scale)', ''],
    ['Content Satisfaction', '=AVERAGE(EvaluationResponses!E:E)'],
    ['Content Difficulty', '=AVERAGE(EvaluationResponses!F:F)'],
    ['Content Usefulness', '=AVERAGE(EvaluationResponses!G:G)'],
    ['Instructor Knowledge', '=AVERAGE(EvaluationResponses!H:H)'],
    ['Instructor Communication', '=AVERAGE(EvaluationResponses!I:I)'],
    ['Instructor Q&A', '=AVERAGE(EvaluationResponses!J:J)'],
    ['Time Duration', '=AVERAGE(EvaluationResponses!K:K)'],
    ['Time Schedule', '=AVERAGE(EvaluationResponses!L:L)'],
    ['Organization Overall', '=AVERAGE(EvaluationResponses!M:M)'],
    ['Platform Satisfaction', '=AVERAGE(EvaluationResponses!N:N)'],
    ['AV Quality', '=AVERAGE(EvaluationResponses!O:O)'],
    ['Overall Satisfaction', '=AVERAGE(EvaluationResponses!P:P)'],
    ['', ''],
    ['Recommendation Distribution', ''],
    ['Recommend', '=COUNTIF(EvaluationResponses!S:S,"yes")'],
    ['Not Recommend', '=COUNTIF(EvaluationResponses!S:S,"no")'],
    ['Maybe Recommend', '=COUNTIF(EvaluationResponses!S:S,"maybe")']
  ];
  
  // Set data
  sheet.getRange(1, 1, summaryData.length, 2).setValues(summaryData);
  
  // Format summary sheet
  formatSummarySheet(sheet);
}

function formatSummarySheet(sheet) {
  // Title formatting
  const titleRange = sheet.getRange(1, 1, 1, 2);
  titleRange.merge();
  titleRange.setBackground('#ef4444');
  titleRange.setFontColor('#ffffff');
  titleRange.setFontWeight('bold');
  titleRange.setFontSize(16);
  titleRange.setHorizontalAlignment('center');
  
  // Section headers
  const sectionRanges = [
    sheet.getRange(4, 1, 1, 2), // Response Statistics
    sheet.getRange(7, 1, 1, 2), // Average Ratings
    sheet.getRange(21, 1, 1, 2)  // Recommendation Distribution
  ];
  
  sectionRanges.forEach(range => {
    range.merge();
    range.setBackground('#f59e0b');
    range.setFontColor('#ffffff');
    range.setFontWeight('bold');
    range.setHorizontalAlignment('center');
  });
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 2);
}

function calculateEvaluationStatistics(data) {
  const headers = data[0];
  const responses = data.slice(1);
  
  const stats = {
    totalResponses: responses.length,
    averageRatings: {},
    recommendationDistribution: { yes: 0, no: 0, maybe: 0 },
    demographics: {
      gender: {},
      age: {}
    }
  };
  
  // Calculate demographics (gender and age)
  responses.forEach(row => {
    // Gender (column 2)
    const gender = row[2];
    if (gender) {
      stats.demographics.gender[gender] = (stats.demographics.gender[gender] || 0) + 1;
    }
    
    // Age (column 3)
    const age = row[3];
    if (age) {
      stats.demographics.age[age] = (stats.demographics.age[age] || 0) + 1;
    }
  });
  
  // Calculate average ratings for rating questions (columns 4-15)
  const ratingColumns = [
    'contentSatisfaction', 'contentDifficulty', 'contentUsefulness',
    'instructorKnowledge', 'instructorCommunication', 'instructorQA',
    'timeDuration', 'timeSchedule', 'organizationOverall',
    'platformSatisfaction', 'avQuality', 'overallSatisfaction'
  ];
  
  ratingColumns.forEach((column, index) => {
    const columnIndex = 4 + index; // Rating columns start at index 4 (after gender/age)
    const values = responses.map(row => parseInt(row[columnIndex]) || 0).filter(val => val > 0);
    stats.averageRatings[column] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  });
  
  // Calculate recommendation distribution (column 16)
  responses.forEach(row => {
    const recommendation = row[16]; // Recommendation column
    if (recommendation === 'แน่นอน') stats.recommendationDistribution.yes++;
    else if (recommendation === 'ไม่แนะนำ') stats.recommendationDistribution.no++;
    else if (recommendation === 'อาจจะ' || recommendation === 'ไม่แน่ใจ') stats.recommendationDistribution.maybe++;
  });
  
  return stats;
}

function updateSummarySheet(sheet, stats) {
  // Update timestamp
  sheet.getRange(2, 2).setValue(new Date().toLocaleString('th-TH'));
  
  // The formulas will automatically update the statistics
  // This function can be extended to add more complex calculations if needed
}

function getEvaluationStatistics() {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    const dataSheet = spreadsheet.getSheetByName(EVALUATION_SHEET_NAME);
    
    if (!dataSheet) {
      return { success: false, error: 'No evaluation data found' };
    }
    
    const data = dataSheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { 
        success: true, 
        stats: { 
          totalResponses: 0,
          averageRatings: {},
          recommendationDistribution: { yes: 0, no: 0, maybe: 0 }
        }
      };
    }
    
    const stats = calculateEvaluationStatistics(data);
    
    return { success: true, stats: stats };
    
  } catch (error) {
    console.error('Error getting statistics:', error);
    return { success: false, error: error.toString() };
  }
}

function calculateEvaluationStatistics(data) {
  try {
    console.log('Calculating statistics for', data.length - 1, 'responses');
    
    // Skip header row
    const responses = data.slice(1);
    const totalResponses = responses.length;
    
    if (totalResponses === 0) {
      return {
        totalResponses: 0,
        averageRatings: {},
        recommendationDistribution: { yes: 0, no: 0, maybe: 0 },
        genderDistribution: {},
        ageDistribution: {}
      };
    }
    
    // Field indices based on our headers
    const fieldIndices = {
      gender: 2,
      age: 3,
      contentSatisfaction: 4,
      contentDifficulty: 5,
      contentUsefulness: 6,
      instructorKnowledge: 7,
      instructorCommunication: 8,
      instructorQA: 9,
      timeDuration: 10,
      timeSchedule: 11,
      organizationOverall: 12,
      platformSatisfaction: 13,
      avQuality: 14,
      overallSatisfaction: 15,
      recommendation: 16
    };
    
    // Calculate averages for rating fields
    const averageRatings = {};
    const ratingFields = [
      'contentSatisfaction', 'contentDifficulty', 'contentUsefulness',
      'instructorKnowledge', 'instructorCommunication', 'instructorQA',
      'timeDuration', 'timeSchedule', 'organizationOverall',
      'platformSatisfaction', 'avQuality', 'overallSatisfaction'
    ];
    
    ratingFields.forEach(field => {
      const values = responses
        .map(row => parseFloat(row[fieldIndices[field]]))
        .filter(val => !isNaN(val) && val > 0);
      
      if (values.length > 0) {
        averageRatings[field] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });
    
    // Calculate recommendation distribution
    const recommendationDistribution = { yes: 0, no: 0, maybe: 0 };
    responses.forEach(row => {
      const rec = row[fieldIndices.recommendation];
      if (rec === 'yes') recommendationDistribution.yes++;
      else if (rec === 'no') recommendationDistribution.no++;
      else if (rec === 'maybe') recommendationDistribution.maybe++;
    });
    
    // Calculate gender distribution
    const genderDistribution = {};
    responses.forEach(row => {
      const gender = row[fieldIndices.gender];
      if (gender) {
        genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;
      }
    });
    
    // Calculate age distribution
    const ageDistribution = {};
    responses.forEach(row => {
      const age = row[fieldIndices.age];
      if (age) {
        ageDistribution[age] = (ageDistribution[age] || 0) + 1;
      }
    });
    
    const stats = {
      totalResponses,
      averageRatings,
      recommendationDistribution,
      genderDistribution,
      ageDistribution,
      overallAverage: averageRatings.overallSatisfaction || 0
    };
    
    console.log('Calculated statistics:', stats);
    return stats;
    
  } catch (error) {
    console.error('Error calculating statistics:', error);
    throw error;
  }
}

function generateEvaluationReport() {
  try {
    const stats = getEvaluationStatistics();
    
    if (!stats.success) {
      return stats;
    }
    
    // Generate Word document content
    const reportContent = generateWordReportContent(stats.stats);
    
    return {
      success: true,
      reportContent: reportContent,
      stats: stats.stats
    };
    
  } catch (error) {
    console.error('Error generating report:', error);
    return { success: false, error: error.toString() };
  }
}

function generateWordReportContent(stats) {
  const reportDate = new Date().toLocaleDateString('th-TH');
  
  const content = {
    title: 'รายงานสรุปผลการประเมินโครงการอบรม',
    subtitle: 'การใช้ AI เขียนโค้ด',
    date: reportDate,
    sections: [
      {
        title: '1. ข้อมูลทั่วไป',
        content: [
          `จำนวนผู้ตอบแบบประเมิน: ${stats.totalResponses} คน`,
          `วันที่สร้างรายงาน: ${reportDate}`
        ]
      },
      {
        title: '2. ผลการประเมินด้านเนื้อหาการอบรม',
        content: [
          `ความพึงพอใจต่อเนื้อหา: ${stats.averageRatings.contentSatisfaction?.toFixed(2) || 'N/A'}/5.00`,
          `ความเหมาะสมของระดับความยาก: ${stats.averageRatings.contentDifficulty?.toFixed(2) || 'N/A'}/5.00`,
          `ความเป็นประโยชน์ของเนื้อหา: ${stats.averageRatings.contentUsefulness?.toFixed(2) || 'N/A'}/5.00`
        ]
      },
      {
        title: '3. ผลการประเมินด้านวิทยากร',
        content: [
          `ความรู้ความสามารถ: ${stats.averageRatings.instructorKnowledge?.toFixed(2) || 'N/A'}/5.00`,
          `ทักษะการสื่อสาร: ${stats.averageRatings.instructorCommunication?.toFixed(2) || 'N/A'}/5.00`,
          `การตอบคำถาม: ${stats.averageRatings.instructorQA?.toFixed(2) || 'N/A'}/5.00`
        ]
      },
      {
        title: '4. ผลการประเมินด้านการจัดงาน',
        content: [
          `ความเหมาะสมของเวลา: ${stats.averageRatings.timeDuration?.toFixed(2) || 'N/A'}/5.00`,
          `การจัดตารางเวลา: ${stats.averageRatings.timeSchedule?.toFixed(2) || 'N/A'}/5.00`,
          `การจัดงานโดยรวม: ${stats.averageRatings.organizationOverall?.toFixed(2) || 'N/A'}/5.00`
        ]
      },
      {
        title: '5. ผลการประเมินด้านเทคโนโลยี',
        content: [
          `แพลตฟอร์มออนไลน์: ${stats.averageRatings.platformSatisfaction?.toFixed(2) || 'N/A'}/5.00`,
          `คุณภาพเสียงและภาพ: ${stats.averageRatings.avQuality?.toFixed(2) || 'N/A'}/5.00`
        ]
      },
      {
        title: '6. ผลการประเมินโดยรวม',
        content: [
          `ความพึงพอใจโดยรวม: ${stats.averageRatings.overallSatisfaction?.toFixed(2) || 'N/A'}/5.00`,
          '',
          'การแนะนำโครงการ:',
          `- แนะนำ: ${stats.recommendationDistribution.yes} คน (${((stats.recommendationDistribution.yes/stats.totalResponses)*100).toFixed(1)}%)`,
          `- ไม่แนะนำ: ${stats.recommendationDistribution.no} คน (${((stats.recommendationDistribution.no/stats.totalResponses)*100).toFixed(1)}%)`,
          `- อาจจะแนะนำ: ${stats.recommendationDistribution.maybe} คน (${((stats.recommendationDistribution.maybe/stats.totalResponses)*100).toFixed(1)}%)`
        ]
      }
    ]
  };
  
  return content;
}

// Test function
function testEvaluationSystem() {
  const testData = {
    participantGender: 'หญิง',
    participantAge: '23-30 ปี',
    contentSatisfaction: '5',
    contentUsefulness: '5',
    contentClarity: '4',
    instructorKnowledge: '5',
    instructorTeaching: '4',
    instructorQA: '4',
    timeAppropriate: '4',
    venueFacilities: '4',
    eventOrganization: '5',
    platformEase: '5',
    platformStability: '4',
    overallSatisfaction: '5',
    recommendation: 'yes',
    improvements: 'ข้อเสนอแนะทดสอบ',
    additionalTopics: 'หัวข้อเพิ่มเติมทดสอบ',
    otherComments: 'ความคิดเห็นอื่นๆ ทดสอบ'
  };

  console.log('Testing evaluation submission...');
  const result = handleEvaluationSubmission(testData);
  console.log('Test result:', result);
  
  return result;
}
