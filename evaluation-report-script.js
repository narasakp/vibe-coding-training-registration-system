// Evaluation Report JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeReportPage();
    loadEvaluationData();
});

const EVALUATION_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIrPo2ADKVNmbBtq6_qgOoQrKiGpxy5bTSkqXZPQwBT8yMqUs5C7sunLPOU58EJ4awCw/exec';

// Global variables
let currentStats = null;
let ratingsChart = null;
let recommendationChart = null;
let genderChart = null;
let ageChart = null;

function initializeReportPage() {
    // Add event listeners
    document.getElementById('loadDataBtn').addEventListener('click', loadEvaluationData);
    document.getElementById('generateReportBtn').addEventListener('click', generateWordReport);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
    
    // Set report date
    document.getElementById('reportDate').textContent = new Date().toLocaleDateString('th-TH');
}

function showLoadingModal() {
    // Simple loading indicator - you can enhance this
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingModal';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: white;
        font-size: 18px;
    `;
    loadingDiv.innerHTML = '<div><i class="fas fa-spinner fa-spin"></i> กำลังโหลดข้อมูล...</div>';
    document.body.appendChild(loadingDiv);
}

function hideLoadingModal() {
    const loadingDiv = document.getElementById('loadingModal');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

async function loadEvaluationData() {
    showLoadingModal();
    
    try {
        console.log('Loading evaluation data from:', EVALUATION_SCRIPT_URL);
        const response = await fetch(`${EVALUATION_SCRIPT_URL}?action=getEvaluationStats`);
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
            currentStats = result.stats;
            updateStatistics(currentStats);
            updateCharts(currentStats);
            updateDetailedReport(currentStats);
            document.getElementById('lastUpdated').textContent = 
                `ข้อมูลล่าสุด: ${new Date().toLocaleString('th-TH')}`;
        } else {
            throw new Error(result.error || 'ไม่สามารถโหลดข้อมูลได้');
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
    } finally {
        hideLoadingModal();
    }
}

function updateStatistics(stats) {
    document.getElementById('totalResponses').textContent = stats.totalResponses || 0;
    document.getElementById('averageRating').textContent = 
        (stats.averageRatings.overallSatisfaction || 0).toFixed(2);
    
    const totalRecommend = stats.recommendationDistribution.yes || 0;
    const total = stats.totalResponses || 1;
    const recommendPercent = ((totalRecommend / total) * 100).toFixed(1);
    document.getElementById('recommendPercent').textContent = recommendPercent + '%';
}

function updateDetailedReport(stats) {
    // Update detailed statistics if there are specific elements for them
    console.log('Updating detailed report with stats:', stats);
    
    // You can add more detailed report updates here
    // For now, just log the stats for debugging
}

function updateCharts(stats) {
    createRatingsChart(stats.averageRatings);
    createRecommendationChart(stats.recommendationDistribution);
    createDemographicsCharts(stats.genderDistribution || {}, stats.ageDistribution || {});
}

function createRatingsChart(ratings) {
    const ctx = document.getElementById('ratingsChart').getContext('2d');
    
    if (ratingsChart) {
        ratingsChart.destroy();
    }
    
    const labels = [
        'เนื้อหา', 'ความยาก', 'ประโยชน์', 'ความรู้วิทยากร',
        'การสื่อสาร', 'การตอบคำถาม', 'ระยะเวลา', 'ตารางเวลา',
        'การจัดงาน', 'แพลตฟอร์ม', 'คุณภาพ AV', 'โดยรวม'
    ];
    
    const data = [
        ratings.contentSatisfaction || 0,
        ratings.contentDifficulty || 0,
        ratings.contentUsefulness || 0,
        ratings.instructorKnowledge || 0,
        ratings.instructorCommunication || 0,
        ratings.instructorQA || 0,
        ratings.timeDuration || 0,
        ratings.timeSchedule || 0,
        ratings.organizationOverall || 0,
        ratings.platformSatisfaction || 0,
        ratings.avQuality || 0,
        ratings.overallSatisfaction || 0
    ];
    
    ratingsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'จำนวนคน',
                data: data,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 20,
                    right: 30,
                    bottom: 20,
                    left: 20
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        color: '#1f2937',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 10
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0,
                        color: '#1f2937',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            }
        }
    });
}

function createRecommendationChart(distribution) {
    const ctx = document.getElementById('recommendationChart').getContext('2d');
    
    if (recommendationChart) {
        recommendationChart.destroy();
    }
    
    recommendationChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['แนะนำ', 'ไม่แนะนำ', 'อาจจะแนะนำ'],
            datasets: [{
                data: [
                    distribution.yes || 0,
                    distribution.no || 0,
                    distribution.maybe || 0
                ],
                backgroundColor: [
                    '#10b981',
                    '#ef4444',
                    '#f59e0b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function createDemographicsCharts(genderDistribution, ageDistribution) {
    createGenderChart(genderDistribution || {});
    createAgeChart(ageDistribution || {});
}

function createGenderChart(genderData) {
    const ctx = document.getElementById('genderChart');
    if (!ctx) {
        console.log('genderChart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (genderChart) {
        genderChart.destroy();
        genderChart = null;
    }
    
    const labels = Object.keys(genderData);
    const data = Object.values(genderData);
    
    if (labels.length === 0) {
        console.log('No gender data available');
        return;
    }
    
    const chartCtx = ctx.getContext('2d');
    
    genderChart = new Chart(chartCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',  // ชาย - น้ำเงิน
                    'rgba(236, 72, 153, 0.8)'   // หญิง - ชมพู
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(236, 72, 153, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    position: 'bottom'
                }
            }
        }
    });
}

function createAgeChart(ageData) {
    const ctx = document.getElementById('ageChart');
    if (!ctx) {
        console.log('ageChart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (ageChart) {
        ageChart.destroy();
        ageChart = null;
    }
    
    const labels = Object.keys(ageData);
    const data = Object.values(ageData);
    
    if (labels.length === 0) {
        console.log('No age data available');
        return;
    }
    
    const chartCtx = ctx.getContext('2d');
    
    ageChart = new Chart(chartCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'จำนวนคน',
                data: data,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 20,
                    right: 30,
                    bottom: 20,
                    left: 20
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#1f2937',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0,
                        color: '#1f2937',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateDetailedReport(stats) {
    // General Info
    document.getElementById('generalInfo').innerHTML = `
        <p>จำนวนผู้ตอบแบบประเมิน: ${stats.totalResponses} คน</p>
        <p>วันที่สร้างรายงาน: ${new Date().toLocaleDateString('th-TH')}</p>
    `;
    
    // Content Evaluation
    document.getElementById('contentEvaluation').innerHTML = `
        <p>ความพึงพอใจต่อเนื้อหา: ${(stats.averageRatings.contentSatisfaction || 0).toFixed(2)}/5.00</p>
        <p>ความเหมาะสมของระดับความยาก: ${(stats.averageRatings.contentDifficulty || 0).toFixed(2)}/5.00</p>
        <p>ความเป็นประโยชน์ของเนื้อหา: ${(stats.averageRatings.contentUsefulness || 0).toFixed(2)}/5.00</p>
    `;
    
    // Instructor Evaluation
    document.getElementById('instructorEvaluation').innerHTML = `
        <p>ความรู้ความสามารถ: ${(stats.averageRatings.instructorKnowledge || 0).toFixed(2)}/5.00</p>
        <p>ทักษะการสื่อสาร: ${(stats.averageRatings.instructorCommunication || 0).toFixed(2)}/5.00</p>
        <p>การตอบคำถาม: ${(stats.averageRatings.instructorQA || 0).toFixed(2)}/5.00</p>
    `;
    
    // Organization Evaluation
    document.getElementById('organizationEvaluation').innerHTML = `
        <p>ความเหมาะสมของเวลา: ${(stats.averageRatings.timeDuration || 0).toFixed(2)}/5.00</p>
        <p>การจัดตารางเวลา: ${(stats.averageRatings.timeSchedule || 0).toFixed(2)}/5.00</p>
        <p>การจัดงานโดยรวม: ${(stats.averageRatings.organizationOverall || 0).toFixed(2)}/5.00</p>
    `;
    
    // Technology Evaluation
    document.getElementById('technologyEvaluation').innerHTML = `
        <p>แพลตฟอร์มออนไลน์: ${(stats.averageRatings.platformSatisfaction || 0).toFixed(2)}/5.00</p>
        <p>คุณภาพเสียงและภาพ: ${(stats.averageRatings.avQuality || 0).toFixed(2)}/5.00</p>
    `;
    
    // Overall Evaluation
    const total = stats.totalResponses || 1;
    document.getElementById('overallEvaluation').innerHTML = `
        <p>ความพึงพอใจโดยรวม: ${(stats.averageRatings.overallSatisfaction || 0).toFixed(2)}/5.00</p>
        <br>
        <p><strong>การแนะนำโครงการ:</strong></p>
        <p>- แนะนำ: ${stats.recommendationDistribution.yes || 0} คน (${(((stats.recommendationDistribution.yes || 0)/total)*100).toFixed(1)}%)</p>
        <p>- ไม่แนะนำ: ${stats.recommendationDistribution.no || 0} คน (${(((stats.recommendationDistribution.no || 0)/total)*100).toFixed(1)}%)</p>
        <p>- อาจจะแนะนำ: ${stats.recommendationDistribution.maybe || 0} คน (${(((stats.recommendationDistribution.maybe || 0)/total)*100).toFixed(1)}%)</p>
    `;
    
    // Conclusions
    document.getElementById('conclusions').innerHTML = generateConclusions(stats);
}

function generateConclusions(stats) {
    const overallRating = stats.averageRatings.overallSatisfaction || 0;
    const recommendPercent = ((stats.recommendationDistribution.yes || 0) / (stats.totalResponses || 1)) * 100;
    
    let conclusion = '<p><strong>สรุปผลการประเมิน:</strong></p>';
    
    if (overallRating >= 4.5) {
        conclusion += '<p>โครงการได้รับการประเมินในระดับดีเยี่ยม ผู้เข้าร่วมมีความพึงพอใจสูงมาก</p>';
    } else if (overallRating >= 4.0) {
        conclusion += '<p>โครงการได้รับการประเมินในระดับดี ผู้เข้าร่วมมีความพึงพอใจในระดับสูง</p>';
    } else if (overallRating >= 3.5) {
        conclusion += '<p>โครงการได้รับการประเมินในระดับปานกลาง ควรมีการปรับปรุงในบางด้าน</p>';
    } else {
        conclusion += '<p>โครงการต้องการการปรับปรุงในหลายด้าน เพื่อเพิ่มความพึงพอใจของผู้เข้าร่วม</p>';
    }
    
    if (recommendPercent >= 80) {
        conclusion += '<p>ผู้เข้าร่วมส่วนใหญ่แนะนำให้จัดโครงการนี้ต่อไป</p>';
    } else if (recommendPercent >= 60) {
        conclusion += '<p>ผู้เข้าร่วมจำนวนมากแนะนำให้จัดโครงการนี้ต่อไป</p>';
    } else {
        conclusion += '<p>ควรปรับปรุงโครงการก่อนจัดในครั้งต่อไป</p>';
    }
    
    return conclusion;
}

async function generateWordReport() {
    if (!currentStats) {
        alert('กรุณาโหลดข้อมูลก่อน');
        return;
    }
    
    showLoadingModal();
    
    try {
        // Generate Word document content
        const wordContent = generateWordContent(currentStats);
        
        // Create and download Word file
        downloadWordFile(wordContent);
        
        showSuccessModal('สร้างรายงาน Word เสร็จสิ้น');
        
    } catch (error) {
        console.error('Error generating Word report:', error);
        alert('เกิดข้อผิดพลาดในการสร้างรายงาน: ' + error.message);
    } finally {
        hideLoadingModal();
    }
}

function generateWordContent(stats) {
    const reportDate = new Date().toLocaleDateString('th-TH');
    
    return `
รายงานสรุปผลการประเมินโครงการอบรม
การใช้ AI เขียนโค้ด

วันที่สร้างรายงาน: ${reportDate}

1. ข้อมูลทั่วไป
จำนวนผู้ตอบแบบประเมิน: ${stats.totalResponses} คน

2. ผลการประเมินด้านเนื้อหาการอบรม
ความพึงพอใจต่อเนื้อหา: ${(stats.averageRatings.contentSatisfaction || 0).toFixed(2)}/5.00
ความเหมาะสมของระดับความยาก: ${(stats.averageRatings.contentDifficulty || 0).toFixed(2)}/5.00
ความเป็นประโยชน์ของเนื้อหา: ${(stats.averageRatings.contentUsefulness || 0).toFixed(2)}/5.00

3. ผลการประเมินด้านวิทยากร
ความรู้ความสามารถ: ${(stats.averageRatings.instructorKnowledge || 0).toFixed(2)}/5.00
ทักษะการสื่อสาร: ${(stats.averageRatings.instructorCommunication || 0).toFixed(2)}/5.00
การตอบคำถาม: ${(stats.averageRatings.instructorQA || 0).toFixed(2)}/5.00

4. ผลการประเมินด้านการจัดงาน
ความเหมาะสมของเวลา: ${(stats.averageRatings.timeDuration || 0).toFixed(2)}/5.00
การจัดตารางเวลา: ${(stats.averageRatings.timeSchedule || 0).toFixed(2)}/5.00
การจัดงานโดยรวม: ${(stats.averageRatings.organizationOverall || 0).toFixed(2)}/5.00

5. ผลการประเมินด้านเทคโนโลยี
แพลตฟอร์มออนไลน์: ${(stats.averageRatings.platformSatisfaction || 0).toFixed(2)}/5.00
คุณภาพเสียงและภาพ: ${(stats.averageRatings.avQuality || 0).toFixed(2)}/5.00

6. ผลการประเมินโดยรวม
ความพึงพอใจโดยรวม: ${(stats.averageRatings.overallSatisfaction || 0).toFixed(2)}/5.00

การแนะนำโครงการ:
- แนะนำ: ${stats.recommendationDistribution.yes || 0} คน (${(((stats.recommendationDistribution.yes || 0)/(stats.totalResponses || 1))*100).toFixed(1)}%)
- ไม่แนะนำ: ${stats.recommendationDistribution.no || 0} คน (${(((stats.recommendationDistribution.no || 0)/(stats.totalResponses || 1))*100).toFixed(1)}%)
- อาจจะแนะนำ: ${stats.recommendationDistribution.maybe || 0} คน (${(((stats.recommendationDistribution.maybe || 0)/(stats.totalResponses || 1))*100).toFixed(1)}%)

7. สรุปและข้อเสนอแนะ
${generateConclusionsText(stats)}
`;
}

function generateConclusionsText(stats) {
    const overallRating = stats.averageRatings.overallSatisfaction || 0;
    const recommendPercent = ((stats.recommendationDistribution.yes || 0) / (stats.totalResponses || 1)) * 100;
    
    let text = 'สรุปผลการประเมิน:\n';
    
    if (overallRating >= 4.5) {
        text += 'โครงการได้รับการประเมินในระดับดีเยี่ยม ผู้เข้าร่วมมีความพึงพอใจสูงมาก\n';
    } else if (overallRating >= 4.0) {
        text += 'โครงการได้รับการประเมินในระดับดี ผู้เข้าร่วมมีความพึงพอใจในระดับสูง\n';
    } else if (overallRating >= 3.5) {
        text += 'โครงการได้รับการประเมินในระดับปานกลาง ควรมีการปรับปรุงในบางด้าน\n';
    } else {
        text += 'โครงการต้องการการปรับปรุงในหลายด้าน เพื่อเพิ่มความพึงพอใจของผู้เข้าร่วม\n';
    }
    
    if (recommendPercent >= 80) {
        text += 'ผู้เข้าร่วมส่วนใหญ่แนะนำให้จัดโครงการนี้ต่อไป';
    } else if (recommendPercent >= 60) {
        text += 'ผู้เข้าร่วมจำนวนมากแนะนำให้จัดโครงการนี้ต่อไป';
    } else {
        text += 'ควรปรับปรุงโครงการก่อนจัดในครั้งต่อไป';
    }
    
    return text;
}

function downloadWordFile(content) {
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `รายงานประเมินโครงการ_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function exportToPDF() {
    if (!currentStats) {
        alert('กรุณาโหลดข้อมูลก่อน');
        return;
    }
    
    showLoadingModal();
    
    try {
        const reportElement = document.getElementById('detailedReport');
        const canvas = await html2canvas(reportElement);
        
        // Create PDF (simplified version)
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `รายงานประเมินโครงการ_${new Date().toISOString().split('T')[0]}.png`;
        link.href = imgData;
        link.click();
        
        showSuccessModal('ส่งออกรายงานเป็นรูปภาพเสร็จสิ้น');
        
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('เกิดข้อผิดพลาดในการส่งออก: ' + error.message);
    } finally {
        hideLoadingModal();
    }
}

function showLoadingModal() {
    document.getElementById('loadingModal').style.display = 'block';
}

function hideLoadingModal() {
    document.getElementById('loadingModal').style.display = 'none';
}

function showSuccessModal(message) {
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
