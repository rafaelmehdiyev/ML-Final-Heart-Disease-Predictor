// Initialize Charts
function initializeCharts() {
    // Only initialize if the elements exist
    const diseaseCtx = document.getElementById('diseaseDistributionChart');
    const bloodPressureCtx = document.getElementById('bloodPressureChart');

    if (diseaseCtx) {
        const diseaseChart = new Chart(diseaseCtx, {
            type: 'doughnut',
            data: {
                labels: ['Healthy', 'Heart Disease'],
                datasets: [{
                    label: 'Disease Distribution',
                    data: [],
                    backgroundColor: ['#28a745', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    if (bloodPressureCtx) {
        const bloodPressureChart = new Chart(bloodPressureCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Risk by Blood Pressure',
                    data: [],
                    backgroundColor: [
                        '#28a745',  // Normal - Green
                        '#ffc107',  // Prehypertension - Yellow
                        '#fd7e14',  // Stage 1 - Orange
                        '#dc3545'   // Stage 2 - Red
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Risk Percentage'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Risk: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Store chart instances globally
let charts = {
    disease: null,
    bloodPressure: null
};

// Function to safely destroy a chart
function destroyChart(chartKey) {
    if (charts[chartKey]) {
        charts[chartKey].destroy();
        charts[chartKey] = null;
    }
}

// Function to safely get canvas context
function getChartContext(canvasId) {
    const canvas = document.getElementById(canvasId);
    // Clear any existing chart
    const chartKey = canvasId === 'diseaseDistributionChart' ? 'disease' : 'bloodPressureChart';
    destroyChart(chartKey);
    // Get fresh context
    return canvas.getContext('2d');
}

// Store chart instance globally
let ageChart = null;

// Function to safely destroy chart
function destroyAgeChart() {
    if (ageChart) {
        ageChart.destroy();
        ageChart = null;
    }
}

// Form Validation and Submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('predictionForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
            submitButton.disabled = true;
            
            try {
                const formData = new FormData(this);
                const response = await fetch('/predict', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    displayPredictionResult(result);
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while processing your request.');
            } finally {
                // Restore button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
});

function displayPredictionResult(result) {
    // Get result container
    const resultContainer = document.getElementById('predictionResult');
    if (!resultContainer) return;
    
    // Update risk level
    const riskLevel = document.getElementById('riskLevel');
    if (riskLevel) {
        const isHighRisk = result.risk_level === 'High';
        riskLevel.textContent = result.risk_level;
        riskLevel.className = 'display-4 mb-3 ' + (isHighRisk ? 'text-danger' : 'text-success');
    }
    
    // Update confidence bar
    const confidenceBar = document.getElementById('confidenceBar');
    if (confidenceBar) {
        const confidenceValue = result.confidence.replace('%', '');
        confidenceBar.style.width = result.confidence;
        confidenceBar.textContent = result.confidence;
        confidenceBar.className = 'progress-bar ' + 
            (result.risk_level === 'High' ? 'bg-danger' : 'bg-success');
    }
    
    // Risk factor descriptions
    const riskFactorDescriptions = {
        'age': 'Age',
        'sex': 'Gender',
        'cp': 'Chest Pain Type',
        'trestbps': 'Resting Blood Pressure',
        'chol': 'Cholesterol Level',
        'fbs': 'Fasting Blood Sugar',
        'restecg': 'Resting ECG Results',
        'thalach': 'Maximum Heart Rate',
        'exang': 'Exercise Induced Angina',
        'oldpeak': 'ST Depression',
        'slope': 'ST Slope',
        'ca': 'Number of Major Vessels',
        'thal': 'Thalassemia',
        // Engineered features
        'chol_ratio': 'Cholesterol Ratio',
        'bmi_approx': 'Body Mass Index (Approximate)',
        'heart_rate_reserve': 'Heart Rate Reserve',
        'bp_category': 'Blood Pressure Category',
        'age_group': 'Age Group'
    };

    // Risk factor explanations
    const riskFactorExplanations = {
        'age': 'Higher age is associated with increased cardiovascular risk',
        'sex': 'Gender can influence heart disease risk patterns',
        'cp': 'Type and severity of chest pain is a key indicator',
        'trestbps': 'High blood pressure is a major risk factor',
        'chol': 'Elevated cholesterol levels increase heart disease risk',
        'fbs': 'High fasting blood sugar may indicate diabetes risk',
        'restecg': 'Abnormal ECG results may indicate heart problems',
        'thalach': 'Maximum heart rate achieved during exercise',
        'exang': 'Chest pain during exercise is a warning sign',
        'oldpeak': 'ST depression induced by exercise relative to rest',
        'slope': 'The slope of the peak exercise ST segment',
        'ca': 'Number of major vessels colored by fluoroscopy',
        'thal': 'A blood disorder that affects oxygen delivery',
        // Engineered features
        'chol_ratio': 'Ratio indicating balance of cholesterol levels',
        'bmi_approx': 'Indicator of body composition and overall health',
        'heart_rate_reserve': 'Difference between max and resting heart rate',
        'bp_category': 'Classification of blood pressure levels',
        'age_group': 'Age range category for risk assessment'
    };

    // Update risk factors
    const riskFactorsList = document.getElementById('riskFactorsList');
    if (riskFactorsList && result.top_risk_factors) {
        const riskFactorsHtml = result.top_risk_factors.map(factor => {
            const readableName = riskFactorDescriptions[factor] || factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const explanation = riskFactorExplanations[factor] || 'A factor in heart disease risk assessment';
            return `
                <li class="list-group-item">
                    <div class="d-flex align-items-start">
                        <i class="fas fa-exclamation-triangle ${result.risk_level === 'High' ? 'text-danger' : 'text-warning'} me-2 mt-1"></i>
                        <div>
                            <strong>${readableName}</strong>
                            <p class="mb-0 text-muted small">${explanation}</p>
                        </div>
                    </div>
                </li>
            `;
        }).join('');
        riskFactorsList.innerHTML = riskFactorsHtml;
    }
    
    // Update recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    if (recommendationsList) {
        const recommendations = [];
        
        // Add risk-level specific recommendations
        if (result.risk_level === 'High') {
            recommendations.push(
                'Schedule an appointment with your healthcare provider',
                'Monitor your blood pressure and cholesterol regularly',
                'Consider lifestyle modifications to reduce risk factors',
                'Follow a heart-healthy diet plan',
                'Engage in regular physical activity as approved by your doctor'
            );
        } else {
            recommendations.push(
                'Maintain your current healthy lifestyle',
                'Continue regular health check-ups',
                'Stay active with regular exercise',
                'Keep following a balanced diet',
                'Monitor your health metrics periodically'
            );
        }
        
        recommendationsList.innerHTML = recommendations.map(rec => `
            <li class="list-group-item">
                <i class="fas fa-check-circle text-success me-2"></i>
                ${rec}
            </li>
        `).join('');
    }
    
    // Show the result container with a smooth animation
    resultContainer.style.opacity = '0';
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
    
    // Fade in animation
    setTimeout(() => {
        resultContainer.style.transition = 'opacity 0.5s ease-in-out';
        resultContainer.style.opacity = '1';
    }, 0);
}

// Example data fill function
function fillExampleData() {
    document.getElementById('age').value = '55';
    document.getElementById('sex').value = '1';
    document.getElementById('cp').value = '1';
    document.getElementById('trestbps').value = '140';
    document.getElementById('chol').value = '240';
    document.getElementById('fbs').value = '0';
    document.getElementById('restecg').value = '1';
    document.getElementById('thalach').value = '150';
    document.getElementById('exang').value = '0';
    document.getElementById('oldpeak').value = '1.5';
    document.getElementById('slope').value = '1';
    document.getElementById('ca').value = '0';
    document.getElementById('thal').value = '2';
}

// Statistics functionality
async function loadStatistics() {
    try {
        const response = await fetch('/api/statistics');
        const data = await response.json();
        
        if (data.status === 'success') {
            // Update basic stats cards
            updateBasicStats(data);
            
            // Create charts
            createDiseaseDistributionChart(data);
            createBloodPressureChart(data);
            createAgeDistributionChart(data);
            
            // Update risk factors and correlations
            displayRiskFactors(data.risk_factors);
            displayCorrelations(data.correlations);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function updateBasicStats(stats) {
    if (!stats) return;

    const { total_patients, disease_count, disease_percentage } = stats.dataset_stats;
    const { mean_age } = stats.age_stats;

    // Update basic statistics
    document.getElementById('totalPatients').textContent = total_patients.toLocaleString();
    document.getElementById('diseaseRate').textContent = disease_percentage.toFixed(1) + '%';
    document.getElementById('averageAge').textContent = mean_age.toFixed(1);
}

function createDiseaseDistributionChart(data) {
    destroyChart('disease');
    
    const ctx = document.getElementById('diseaseDistributionChart')?.getContext('2d');
    if (!ctx) return;
    
    charts.disease = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Healthy', 'Heart Disease'],
            datasets: [{
                data: [
                    data.dataset_stats.healthy_count,
                    data.dataset_stats.disease_count
                ],
                backgroundColor: ['#28a745', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createBloodPressureChart(data) {
    if (!data.risk_factors?.blood_pressure) return;
    
    destroyChart('bloodPressure');
    
    const ctx = document.getElementById('bloodPressureChart')?.getContext('2d');
    if (!ctx) return;
    
    const bpData = data.risk_factors.blood_pressure;
    
    // Add labels for blood pressure ranges
    const bpLabels = {
        '0-120': 'Normal',
        '120-140': 'Prehypertension',
        '140-160': 'Stage 1 Hypertension',
        '160-200': 'Stage 2 Hypertension'
    };
    
    charts.bloodPressure = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(bpData).map(range => bpLabels[range] || range),
            datasets: [{
                label: 'Risk by Blood Pressure',
                data: Object.values(bpData),
                backgroundColor: [
                    '#28a745',  // Normal - Green
                    '#ffc107',  // Prehypertension - Yellow
                    '#fd7e14',  // Stage 1 - Orange
                    '#dc3545'   // Stage 2 - Red
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Risk Percentage'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Risk: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

function createAgeDistributionChart(data) {
    destroyAgeChart();
    
    const ctx = document.getElementById('ageDistributionChart')?.getContext('2d');
    if (!ctx) return;
    
    // Process age data into bins
    const ageBins = [20, 30, 40, 50, 60, 70, 80, 90];
    const ageGroups = {};
    const diseaseRisk = {};
    
    // Initialize bins
    for (let i = 0; i < ageBins.length - 1; i++) {
        const binLabel = `${ageBins[i]}-${ageBins[i+1]}`;
        ageGroups[binLabel] = 0;
        diseaseRisk[binLabel] = 0;
    }
    
    // Calculate age distribution and disease risk
    data.age_stats.age_data.forEach(age => {
        for (let i = 0; i < ageBins.length - 1; i++) {
            if (age >= ageBins[i] && age < ageBins[i+1]) {
                const binLabel = `${ageBins[i]}-${ageBins[i+1]}`;
                ageGroups[binLabel]++;
                break;
            }
        }
    });
    
    // Calculate disease risk for each age group
    Object.keys(ageGroups).forEach(group => {
        const [start, end] = group.split('-').map(Number);
        const agesInGroup = data.age_stats.age_data.filter(age => age >= start && age < end);
        const diseasedInGroup = data.age_stats.diseased_ages.filter(age => age >= start && age < end);
        diseaseRisk[group] = agesInGroup.length > 0 ? (diseasedInGroup.length / agesInGroup.length) * 100 : 0;
    });
    
    ageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ageGroups),
            datasets: [
                {
                    label: 'Number of Patients',
                    data: Object.values(ageGroups),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Disease Risk (%)',
                    data: Object.values(diseaseRisk),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Number of Patients'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    max: 100,
                    title: {
                        display: true,
                        text: 'Disease Risk (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (label === 'Disease Risk (%)') {
                                return `${label}: ${value.toFixed(1)}%`;
                            }
                            return `${label}: ${value}`;
                        }
                    }
                }
            }
        }
    });
}

function displayRiskFactors(riskFactors) {
    const container = document.getElementById('riskFactorsContent');
    if (!container || !riskFactors) return;

    let html = '<div class="row g-4">';
    
    // Helper function to create risk factor cards
    const createRiskCard = (title, data, icon) => {
        if (!data || data.length === 0) return '';

        // Map chest pain types to readable names
        const chestPainTypes = {
            '0': 'Typical Angina',
            '1': 'Atypical Angina',
            '2': 'Non-Anginal Pain',
            '3': 'Asymptomatic'
        };
        
        const formatCategory = (category, title) => {
            if (title === 'Chest Pain Types') {
                return chestPainTypes[category] || category;
            }
            return category;
        };
        
        const highestRisk = data[0];
        const riskLevel = highestRisk.risk_percentage >= 70 ? 'high' : 
                         highestRisk.risk_percentage >= 40 ? 'medium' : 'low';
        
        return `
            <div class="col-md-6">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title d-flex align-items-center mb-4">
                            <i class="fas ${icon} me-2 text-primary"></i>
                            ${title}
                        </h5>
                        <div class="risk-factors-list">
                            ${data.map(item => `
                                <div class="risk-factor-item mb-3">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span class="fw-medium">${formatCategory(item.category, title)}</span>
                                        <span class="badge bg-${item.risk_percentage >= 70 ? 'danger' : 
                                                               item.risk_percentage >= 40 ? 'warning' : 'success'} px-2">
                                            ${item.risk_percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div class="progress" style="height: 8px;">
                                        <div class="progress-bar bg-${item.risk_percentage >= 70 ? 'danger' : 
                                                                     item.risk_percentage >= 40 ? 'warning' : 'success'}" 
                                             role="progressbar" 
                                             style="width: ${item.risk_percentage}%" 
                                             aria-valuenow="${item.risk_percentage}" 
                                             aria-valuemin="0" 
                                             aria-valuemax="100">
                                        </div>
                                    </div>
                                    <small class="text-muted d-block mt-1">
                                        Based on ${item.count} patients
                                    </small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>`;
    };

    // Create cards for each risk factor
    html += createRiskCard('Chest Pain Types', riskFactors.chest_pain, 'fa-heartbeat');
    html += createRiskCard('Blood Sugar Impact', riskFactors.fasting_blood_sugar, 'fa-tint');
    html += createRiskCard('Exercise Angina', riskFactors.exercise_angina, 'fa-running');

    html += '</div>';
    container.innerHTML = html;
}

function displayCorrelations(correlations) {
    const container = document.getElementById('correlationsContent');
    if (!container || !correlations) return;

    // Define readable names for features
    const featureNames = {
        'age': 'Age',
        'ca': 'Number of Major Vessels',
        'chol': 'Cholesterol Level',
        'cp': 'Chest Pain Type',
        'exang': 'Exercise Induced Angina',
        'fbs': 'Fasting Blood Sugar',
        'oldpeak': 'ST Depression',
        'restecg': 'Resting ECG Results',
        'sex': 'Gender',
        'slope': 'ST Slope',
        'thal': 'Thalassemia',
        'thalach': 'Maximum Heart Rate',
        'trestbps': 'Resting Blood Pressure'
    };

    // Sort correlations by absolute value to show strongest correlations first
    const sortedCorrelations = Object.entries(correlations)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

    let html = `
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title mb-4">
                    <i class="fas fa-link text-primary me-2"></i>
                    Feature Correlations with Heart Disease
                </h5>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Correlation</th>
                                <th>Impact</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedCorrelations.map(([feature, value]) => {
                                const absValue = Math.abs(value);
                                let impact = absValue >= 0.3 ? 'Strong' :
                                           absValue >= 0.2 ? 'Moderate' : 'Weak';
                                let impactClass = absValue >= 0.3 ? 'text-danger' :
                                                absValue >= 0.2 ? 'text-warning' : 'text-success';
                                let direction = value >= 0 ? 'Positive' : 'Negative';
                                
                                return `
                                    <tr>
                                        <td>
                                            <span class="fw-medium">${featureNames[feature]}</span>
                                            <i class="fas fa-info-circle ms-2 text-muted" 
                                               data-bs-toggle="tooltip" 
                                               title="Technical name: ${feature}">
                                            </i>
                                        </td>
                                        <td>
                                            <span class="badge ${value >= 0 ? 'bg-primary' : 'bg-secondary'}">
                                                ${value.toFixed(3)}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="${impactClass}">
                                                ${impact} ${direction}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="mt-3 text-muted small">
                    <p><strong>Note:</strong> Correlation values range from -1 to 1:</p>
                    <ul class="mb-0">
                        <li>Positive values indicate the feature increases with heart disease risk</li>
                        <li>Negative values indicate the feature decreases with heart disease risk</li>
                        <li>Values closer to 0 indicate weaker relationships</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Initialize tooltips
    const tooltips = [].slice.call(container.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltips.map(function (tooltipTrigger) {
        return new bootstrap.Tooltip(tooltipTrigger);
    });
}

// Initialize statistics when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Ensure any existing charts are destroyed
    Object.keys(charts).forEach(key => destroyChart(key));
    destroyAgeChart();
    // Load fresh statistics
    loadStatistics();
});

// Initialize charts if we're on the statistics page
try {
    initializeCharts();
} catch (error) {
    console.warn('Charts initialization skipped:', error);
}
