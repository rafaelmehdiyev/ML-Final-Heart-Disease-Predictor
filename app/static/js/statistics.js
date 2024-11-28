// Load statistics when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadBasicStats();
    loadRiskFactors();
    loadCorrelations();
    loadPlots();
});

async function loadBasicStats() {
    try {
        const response = await fetch('/api/statistics/basic');
        const data = await response.json();
        
        // Update basic statistics cards
        document.getElementById('totalPatients').textContent = data.dataset_stats.total_patients;
        document.getElementById('diseaseRate').textContent = data.dataset_stats.disease_percentage + '%';
        document.getElementById('averageAge').textContent = data.age_stats.mean_age;
        
        const malePercent = (data.gender_stats.male_count / data.dataset_stats.total_patients * 100).toFixed(1);
        document.getElementById('genderRatio').textContent = `${malePercent}% Male`;
    } catch (error) {
        console.error('Error loading basic stats:', error);
    }
}

async function loadRiskFactors() {
    try {
        const response = await fetch('/api/statistics/risk_factors');
        const data = await response.json();
        
        // Update risk factors visualization
        const riskFactorsContainer = document.getElementById('riskFactorsContent');
        
        // Age groups risk
        let ageGroupsHtml = '<div class="mb-4"><h5>Risk by Age Group</h5>';
        Object.entries(data.age_groups).forEach(([group, risk]) => {
            ageGroupsHtml += `
            <div class="mb-2">
                <div class="d-flex justify-content-between mb-1">
                    <span>${group}</span>
                    <span>${risk.toFixed(1)}%</span>
                </div>
                <div class="progress">
                    <div class="progress-bar bg-danger" role="progressbar" 
                         style="width: ${risk}%" aria-valuenow="${risk}" 
                         aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>`;
        });
        ageGroupsHtml += '</div>';
        
        // Gender risk
        let genderHtml = '<div class="mb-4"><h5>Risk by Gender</h5>';
        Object.entries(data.gender).forEach(([gender, risk]) => {
            genderHtml += `
            <div class="mb-2">
                <div class="d-flex justify-content-between mb-1">
                    <span>${gender.charAt(0).toUpperCase() + gender.slice(1)}</span>
                    <span>${risk.toFixed(1)}%</span>
                </div>
                <div class="progress">
                    <div class="progress-bar bg-danger" role="progressbar" 
                         style="width: ${risk}%" aria-valuenow="${risk}" 
                         aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>`;
        });
        genderHtml += '</div>';
        
        riskFactorsContainer.innerHTML = ageGroupsHtml + genderHtml;
    } catch (error) {
        console.error('Error loading risk factors:', error);
    }
}

async function loadCorrelations() {
    try {
        const response = await fetch('/api/statistics/correlations');
        const data = await response.json();
        
        // Update correlations visualization
        const correlationsContainer = document.getElementById('correlationsContent');
        let html = '<div class="table-responsive"><table class="table table-hover">';
        html += '<thead><tr><th>Feature</th><th>Correlation with Heart Disease</th></tr></thead><tbody>';
        
        Object.entries(data).forEach(([feature, correlation]) => {
            const absCorrelation = Math.abs(correlation);
            const correlationClass = correlation > 0 ? 'text-danger' : 'text-success';
            html += `
            <tr>
                <td>${feature}</td>
                <td class="${correlationClass}">${correlation.toFixed(3)}</td>
            </tr>`;
        });
        
        html += '</tbody></table></div>';
        correlationsContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading correlations:', error);
    }
}

async function loadPlots() {
    try {
        const response = await fetch('/api/statistics/plots');
        const data = await response.json();
        
        // Update plots
        const plotsContainer = document.getElementById('visualizationsContent');
        let html = '';
        
        // Age Distribution Plot
        if (data.age_distribution) {
            html += `
            <div class="mb-4">
                <h5>Age Distribution</h5>
                <img src="data:image/png;base64,${data.age_distribution}" 
                     class="img-fluid" alt="Age Distribution">
            </div>`;
        }
        
        // Correlation Heatmap
        if (data.correlation_heatmap) {
            html += `
            <div class="mb-4">
                <h5>Feature Correlations</h5>
                <img src="data:image/png;base64,${data.correlation_heatmap}" 
                     class="img-fluid" alt="Correlation Heatmap">
            </div>`;
        }
        
        // Age Risk Plot
        if (data.age_risk) {
            html += `
            <div class="mb-4">
                <h5>Risk by Age Group</h5>
                <img src="data:image/png;base64,${data.age_risk}" 
                     class="img-fluid" alt="Risk by Age Group">
            </div>`;
        }
        
        plotsContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading plots:', error);
    }
}
