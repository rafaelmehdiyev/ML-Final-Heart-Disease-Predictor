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
            
            // Check if all required fields are filled
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            let firstInvalidField = null;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                    // Add invalid-feedback div if it doesn't exist
                    if (!field.nextElementSibling?.classList.contains('invalid-feedback')) {
                        const feedback = document.createElement('div');
                        feedback.className = 'invalid-feedback';
                        feedback.textContent = 'This field is required';
                        field.parentNode.appendChild(feedback);
                    }
                    if (!firstInvalidField) {
                        firstInvalidField = field;
                    }
                } else {
                    field.classList.remove('is-invalid');
                }
            });

            if (!isValid) {
                firstInvalidField.focus();
                return;
            }
            
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
                    // Show error in a non-intrusive way
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
                    errorDiv.innerHTML = `
                        <strong>Error:</strong> ${result.message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    `;
                    form.insertAdjacentElement('afterend', errorDiv);
                }
            } catch (error) {
                console.error('Error:', error);
                // Show error in a non-intrusive way
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
                errorDiv.innerHTML = `
                    <strong>Error:</strong> An error occurred while processing your request.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                form.insertAdjacentElement('afterend', errorDiv);
            } finally {
                // Restore button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        });

        // Add input event listeners to remove invalid class when user starts typing
        form.querySelectorAll('[required]').forEach(field => {
            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('is-invalid');
                    // Remove invalid feedback if it exists
                    const feedback = this.nextElementSibling;
                    if (feedback?.classList.contains('invalid-feedback')) {
                        feedback.remove();
                    }
                }
            });
        });
    }
});

function displayPredictionResult(result) {
    // Get result container and show it
    const resultContainer = document.getElementById('predictionResult');
    if (!resultContainer) return;
    resultContainer.style.display = 'block';

    // Convert confidence to number
    const confidenceValue = parseFloat(result.confidence);
    
    // Update risk score with context
    const riskScore = document.getElementById('riskScore');
    if (riskScore) {
        riskScore.innerHTML = `${confidenceValue.toFixed(1)}<span class="fs-6">%</span>`;
    }

    // Update progress bar
    const riskProgressBar = document.getElementById('riskProgressBar');
    if (riskProgressBar) {
        riskProgressBar.style.width = `${confidenceValue}%`;
        riskProgressBar.setAttribute('aria-valuenow', confidenceValue);
        
        // Set color based on risk level
        if (result.risk_level === 'High') {
            riskProgressBar.className = 'progress-bar bg-danger';
        } else if (result.risk_level === 'Moderate') {
            riskProgressBar.className = 'progress-bar bg-warning';
        } else {
            riskProgressBar.className = 'progress-bar bg-success';
        }
    }

    // Update risk level and description
    const riskLevelElement = document.getElementById('riskLevel');
    const riskDescription = document.getElementById('riskDescription');
    const riskAlert = document.getElementById('riskAlert');
    
    if (riskLevelElement && riskDescription && riskAlert) {
        riskLevelElement.textContent = `${result.risk_level} Risk Level`;
        
        // Set description and alert class based on risk level
        let description, alertClass;
        if (result.risk_level === 'High') {
            alertClass = 'alert-danger';
            description = `Based on our model's analysis, there is a ${confidenceValue.toFixed(1)}% probability of heart disease presence. This high percentage suggests significant cardiovascular risk factors that should be evaluated by a healthcare provider.`;
        } else if (result.risk_level === 'Moderate') {
            alertClass = 'alert-warning';
            description = `Based on our model's analysis, there is a ${confidenceValue.toFixed(1)}% probability of heart disease presence. This moderate percentage indicates some risk factors that should be discussed with your healthcare provider.`;
        } else {
            alertClass = 'alert-success';
            description = `Based on our model's analysis, there is a ${confidenceValue.toFixed(1)}% probability of heart disease presence. While this percentage suggests lower risk, continue maintaining a healthy lifestyle and regular check-ups.`;
        }
        
        riskAlert.className = `alert mb-0 ${alertClass}`;
        riskDescription.textContent = description;
    }

    // Update interpretation text
    const riskInterpretation = document.getElementById('riskInterpretation');
    if (riskInterpretation) {
        let interpretation = 'Our machine learning model analyzes multiple risk factors to estimate the probability of heart disease presence. ';
        
        if (result.risk_level === 'High') {
            interpretation += 'A probability of 70% or higher indicates a significant presence of risk factors associated with heart disease. Immediate medical consultation is recommended.';
        } else if (result.risk_level === 'Moderate') {
            interpretation += 'A probability between 40-70% suggests moderate risk factors that warrant attention and preventive measures. Consider scheduling a check-up.';
        } else {
            interpretation += 'A probability below 40% indicates fewer risk factors, but maintaining a healthy lifestyle is still important for heart health.';
        }
        
        riskInterpretation.textContent = interpretation;
    }

    // Update key factors
    const keyFactorsContainer = document.getElementById('keyFactors');
    if (keyFactorsContainer && result.top_risk_factors && result.top_risk_factors.length > 0) {
        keyFactorsContainer.innerHTML = ''; // Clear existing factors
        
        // Define icons for each factor type
        const factorIcons = {
            'age': 'calendar-alt',
            'sex': 'venus-mars',
            'cp': 'heart',
            'trestbps': 'tachometer-alt',
            'chol': 'flask',
            'fbs': 'tint',
            'restecg': 'heartbeat',
            'thalach': 'heartbeat', // Changed from heart-pulse to heartbeat
            'exang': 'heart-broken',
            'oldpeak': 'chart-line',
            'slope': 'angle-double-up',
            'ca': 'project-diagram',
            'thal': 'vial'
        };

        // Add key risk factors
        result.top_risk_factors.forEach(factor => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 mb-3';
            
            // Get the appropriate icon or use a default
            const icon = factorIcons[factor.factor] || 'exclamation-circle';
            
            col.innerHTML = `
                <div class="card h-100 border-0 bg-light">
                    <div class="card-body">
                        <div class="d-flex align-items-start">
                            <div class="flex-shrink-0">
                                <i class="fas fa-${icon} fa-2x ${result.risk_level === 'High' ? 'text-danger' : result.risk_level === 'Moderate' ? 'text-warning' : 'text-primary'}"></i>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h6 class="mb-1">${factor.value}</h6>
                                <p class="mb-0 text-muted small">${factor.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            keyFactorsContainer.appendChild(col);
        });
    } else if (keyFactorsContainer) {
        keyFactorsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    No significant risk factors identified. Continue maintaining a healthy lifestyle.
                </div>
            </div>
        `;
    }

    // Update recommendations
    const recommendationsList = document.getElementById('recommendations');
    if (recommendationsList) {
        recommendationsList.innerHTML = ''; // Clear existing recommendations
        
        // Add recommendations based on risk level and factors
        const recommendations = [];
        
        if (result.risk_level === 'High') {
            recommendations.push('Schedule an appointment with a cardiologist for a thorough evaluation');
            recommendations.push('Begin monitoring your blood pressure and heart rate regularly');
        }
        
        // Add general recommendations
        recommendations.push('Maintain a heart-healthy diet rich in fruits, vegetables, and whole grains');
        recommendations.push('Engage in regular physical activity (at least 150 minutes per week)');
        recommendations.push('Keep stress levels in check through relaxation techniques');
        recommendations.push('Ensure adequate sleep (7-9 hours per night)');
        
        // Add factor-specific recommendations
        if (result.risk_factors) {
            if (result.risk_factors.chol > 200) {
                recommendations.push('Work on lowering your cholesterol through diet and exercise');
            }
            if (result.risk_factors.trestbps > 140) {
                recommendations.push('Focus on blood pressure management through lifestyle changes');
            }
        }
        
        // Add recommendations to the list
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationsList.appendChild(li);
        });
    }

    // Scroll to results
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    const createRiskCard = (title, data, icon, translationKey) => {
        if (!data || data.length === 0) return '';

        // Map chest pain types to readable names
        const chestPainTypes = {
            '0': translations[currentLanguage].typicalAngina,
            '1': translations[currentLanguage].atypicalAngina,
            '2': translations[currentLanguage].nonAnginalPain,
            '3': translations[currentLanguage].asymptomatic
        };
        
        const formatCategory = (category, title) => {
            if (title === translations[currentLanguage].chestPainTypes) {
                return chestPainTypes[category] || category;
            }
            return translations[currentLanguage][category] || category;
        };
        
        const formatBasedOnPatients = (count) => {
            return translations[currentLanguage].basedOnPatients.replace('{n}', count);
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
                            <span data-translate="${translationKey}">${title}</span>
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
                                        ${formatBasedOnPatients(item.count)}
                                    </small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>`;
    };

    // Create cards for each risk factor
    html += createRiskCard(translations[currentLanguage].chestPainTypes, riskFactors.chest_pain, 'fa-heartbeat', 'chestPainTypes');
    html += createRiskCard(translations[currentLanguage].bloodSugarImpact, riskFactors.fasting_blood_sugar, 'fa-tint', 'bloodSugarImpact');
    html += createRiskCard(translations[currentLanguage].exerciseAnginaStats, riskFactors.exercise_angina, 'fa-running', 'exerciseAnginaStats');

    html += '</div>';
    container.innerHTML = html;
    updatePageTranslations(); // Update translations after adding new content
}

function displayCorrelations(correlations) {
    const container = document.getElementById('correlationsContent');
    if (!container || !correlations) return;

    // Define readable names for features with translation keys
    const featureNames = {
        'age': { text: translations[currentLanguage].age, key: 'age' },
        'ca': { text: translations[currentLanguage].majorVessels, key: 'majorVessels' },
        'chol': { text: translations[currentLanguage].serumCholesterol, key: 'serumCholesterol' },
        'cp': { text: translations[currentLanguage].chestPainType, key: 'chestPainType' },
        'exang': { text: translations[currentLanguage].exerciseAngina, key: 'exerciseAngina' },
        'fbs': { text: translations[currentLanguage].fastingBloodSugar, key: 'fastingBloodSugar' },
        'oldpeak': { text: translations[currentLanguage].stDepression, key: 'stDepression' },
        'restecg': { text: translations[currentLanguage].restingEcg, key: 'restingEcg' },
        'sex': { text: translations[currentLanguage].gender, key: 'gender' },
        'slope': { text: translations[currentLanguage].slope, key: 'slope' },
        'thal': { text: translations[currentLanguage].thalassemia, key: 'thalassemia' },
        'thalach': { text: translations[currentLanguage].maxHeartRate, key: 'maxHeartRate' },
        'trestbps': { text: translations[currentLanguage].restingBloodPressure, key: 'restingBloodPressure' }
    };

    // Sort correlations by absolute value
    const sortedCorrelations = Object.entries(correlations)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

    let html = `
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title mb-4">
                    <i class="fas fa-link text-primary me-2"></i>
                    <span data-translate="featureCorrelationsWithHeartDisease">Feature Correlations with Heart Disease</span>
                </h5>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th data-translate="feature">Feature</th>
                                <th data-translate="correlation">Correlation</th>
                                <th data-translate="impact">Impact</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedCorrelations.map(([feature, value]) => {
                                const absValue = Math.abs(value);
                                let impact = absValue >= 0.3 ? translations[currentLanguage].strongPositive :
                                           absValue >= 0.2 ? translations[currentLanguage].moderatePositive :
                                           value >= 0 ? translations[currentLanguage].weakPositive :
                                           translations[currentLanguage].weakNegative;
                                let impactClass = absValue >= 0.3 ? 'text-danger' :
                                                absValue >= 0.2 ? 'text-warning' : 'text-success';
                                
                                return `
                                    <tr>
                                        <td>
                                            <span class="fw-medium" data-translate="${featureNames[feature].key}">
                                                ${featureNames[feature].text}
                                            </span>
                                            <i class="fas fa-info-circle ms-2 text-muted" 
                                               data-bs-toggle="tooltip" 
                                               title="${feature}">
                                            </i>
                                        </td>
                                        <td>
                                            <span class="badge ${value >= 0 ? 'bg-primary' : 'bg-secondary'}">
                                                ${value.toFixed(3)}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="${impactClass}" data-translate="${impact.toLowerCase().replace(' ', '')}">
                                                ${impact}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="mt-3 text-muted small">
                    <p><strong data-translate="correlationNote">Note: Correlation values range from -1 to 1:</strong></p>
                    <ul class="mb-0">
                        <li data-translate="correlationPositive">Positive values indicate the feature increases with heart disease risk</li>
                        <li data-translate="correlationNegative">Negative values indicate the feature decreases with heart disease risk</li>
                        <li data-translate="correlationWeak">Values closer to 0 indicate weaker relationships</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
    updatePageTranslations(); // Update translations after adding new content
}

// Language handling
let currentLanguage = localStorage.getItem('language') || 'en';

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.getElementById('currentLanguage').textContent = lang === 'en' ? 'English' : 'Azərbaycan';
    updatePageTranslations();
}

function updatePageTranslations() {
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });

    // Update placeholders for input elements
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        if (translations[currentLanguage][key]) {
            element.placeholder = translations[currentLanguage][key];
        }
    });

    // Update select options with data-translate attribute
    document.querySelectorAll('select option[data-translate]').forEach(option => {
        const key = option.getAttribute('data-translate');
        if (translations[currentLanguage][key]) {
            option.textContent = translations[currentLanguage][key];
        }
    });

    // Update current language display
    const currentLangDisplay = document.getElementById('currentLanguage');
    if (currentLangDisplay) {
        currentLangDisplay.textContent = currentLanguage === 'en' ? 'English' : 'Azərbaycanca';
    }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial language
    changeLanguage(currentLanguage);
    
    const form = document.getElementById('predictionForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Check if all required fields are filled
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            let firstInvalidField = null;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                    // Add invalid-feedback div if it doesn't exist
                    if (!field.nextElementSibling?.classList.contains('invalid-feedback')) {
                        const feedback = document.createElement('div');
                        feedback.className = 'invalid-feedback';
                        feedback.textContent = 'This field is required';
                        field.parentNode.appendChild(feedback);
                    }
                    if (!firstInvalidField) {
                        firstInvalidField = field;
                    }
                } else {
                    field.classList.remove('is-invalid');
                }
            });

            if (!isValid) {
                firstInvalidField.focus();
                return;
            }
            
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
                    // Show error in a non-intrusive way
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
                    errorDiv.innerHTML = `
                        <strong>Error:</strong> ${result.message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    `;
                    form.insertAdjacentElement('afterend', errorDiv);
                }
            } catch (error) {
                console.error('Error:', error);
                // Show error in a non-intrusive way
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
                errorDiv.innerHTML = `
                    <strong>Error:</strong> An error occurred while processing your request.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                form.insertAdjacentElement('afterend', errorDiv);
            } finally {
                // Restore button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        });

        // Add input event listeners to remove invalid class when user starts typing
        form.querySelectorAll('[required]').forEach(field => {
            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('is-invalid');
                    // Remove invalid feedback if it exists
                    const feedback = this.nextElementSibling;
                    if (feedback?.classList.contains('invalid-feedback')) {
                        feedback.remove();
                    }
                }
            });
        });
    }
    
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
