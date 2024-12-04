function displayCorrelations(correlations) {
    const tbody = document.getElementById('correlationsBody');
    if (!tbody) return;

    // Sort correlations by absolute value
    const sortedCorrelations = Object.entries(correlations)
        .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a));

    tbody.innerHTML = sortedCorrelations.map(([feature, correlation]) => {
        const absCorr = Math.abs(correlation);
        let impact;
        let badgeClass;

        if (absCorr >= 0.3) {
            impact = `Strong ${correlation > 0 ? 'Positive' : 'Negative'}`;
            badgeClass = 'bg-primary';
        } else if (absCorr >= 0.2) {
            impact = `Moderate ${correlation > 0 ? 'Positive' : 'Negative'}`;
            badgeClass = 'bg-accent';
        } else {
            impact = `Weak ${correlation > 0 ? 'Positive' : 'Negative'}`;
            badgeClass = 'bg-secondary-accent';
        }

        return `
            <tr>
                <td>${feature}</td>
                <td>${correlation.toFixed(3)}</td>
                <td><span class="badge ${badgeClass}">${impact}</span></td>
            </tr>
        `;
    }).join('');
}
