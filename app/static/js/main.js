// Initialize Charts
function initializeCharts() {
    // Only initialize if the elements exist
    const ageCtx = document.getElementById('ageDistributionChart');
    const genderCtx = document.getElementById('genderDistributionChart');

    if (ageCtx) {
        const ageChart = new Chart(ageCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Age Distribution',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    if (genderCtx) {
        const genderChart = new Chart(genderCtx, {
            type: 'doughnut',
            data: {
                labels: ['Male', 'Female'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 99, 132, 0.5)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });
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

// Initialize charts if we're on the statistics page
try {
    initializeCharts();
} catch (error) {
    console.warn('Charts initialization skipped:', error);
}
