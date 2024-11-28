import pandas as pd
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report
import matplotlib
matplotlib.use('Agg')  # Set backend to Agg before importing pyplot
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from scipy import stats

class HeartDiseaseStatistics:
    def __init__(self, data_path='app/models/data/heart_disease_combined.csv'):
        """Initialize with the dataset"""
        try:
            self.data = pd.read_csv(data_path)
            self.data['target'] = (self.data['target'] > 0).astype(int)
            # Create age groups once during initialization
            self.data['age_group'] = pd.cut(self.data['age'], 
                                          bins=[0, 40, 50, 60, 70, 100],
                                          labels=['<40', '40-50', '50-60', '60-70', '>70'])
            # Set style for plots
            plt.style.use('default')
            sns.set_theme(style="whitegrid")
        except Exception as e:
            print(f"Error initializing HeartDiseaseStatistics: {str(e)}")
            raise
    
    def get_basic_stats(self):
        """Get basic statistics about the dataset"""
        try:
            total_patients = len(self.data)
            disease_count = self.data['target'].sum()
            healthy_count = total_patients - disease_count
            disease_percentage = (disease_count / total_patients) * 100
            
            age_stats = {
                'mean_age': round(self.data['age'].mean(), 2),
                'min_age': int(self.data['age'].min()),
                'max_age': int(self.data['age'].max()),
                'age_std': round(self.data['age'].std(), 2)
            }
            
            gender_stats = self.data['sex'].value_counts().to_dict()
            gender_stats = {
                'male_count': int(gender_stats.get(1, 0)),
                'female_count': int(gender_stats.get(0, 0))
            }
            
            return {
                'dataset_stats': {
                    'total_patients': total_patients,
                    'disease_count': int(disease_count),
                    'healthy_count': int(healthy_count),
                    'disease_percentage': round(disease_percentage, 2)
                },
                'age_stats': age_stats,
                'gender_stats': gender_stats
            }
        except Exception as e:
            print(f"Error in get_basic_stats: {str(e)}")
            return None
    
    def get_risk_factors(self):
        """Analyze key risk factors"""
        try:
            risk_factors = {}
            
            # Analyze age groups (using pre-calculated groups)
            age_risk = self.data.groupby('age_group')['target'].mean() * 100
            risk_factors['age_groups'] = {str(k): float(v) for k, v in age_risk.items()}
            
            # Analyze gender risk
            gender_risk = self.data.groupby('sex')['target'].mean() * 100
            risk_factors['gender'] = {
                'male': float(gender_risk.get(1, 0)),
                'female': float(gender_risk.get(0, 0))
            }
            
            # Analyze chest pain types
            cp_risk = self.data.groupby('cp')['target'].mean() * 100
            risk_factors['chest_pain'] = {str(k): float(v) for k, v in cp_risk.items()}
            
            # Blood pressure risk
            bp_ranges = pd.cut(self.data['trestbps'], 
                             bins=[0, 120, 140, 160, 200],
                             labels=['Normal', 'Prehypertension', 'Stage 1', 'Stage 2'])
            bp_risk = self.data.groupby(bp_ranges)['target'].mean() * 100
            risk_factors['blood_pressure'] = {str(k): float(v) if pd.notnull(v) else 0.0 
                                            for k, v in bp_risk.items()}
            
            return risk_factors
        except Exception as e:
            print(f"Error in get_risk_factors: {str(e)}")
            return None
    
    def get_correlation_analysis(self):
        """Analyze correlations between features"""
        try:
            numeric_cols = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak']
            corr_matrix = self.data[numeric_cols + ['target']].corr()
            
            correlations = {}
            for col in numeric_cols:
                correlations[col] = float(corr_matrix.loc[col, 'target'])
            
            return correlations
        except Exception as e:
            print(f"Error in get_correlation_analysis: {str(e)}")
            return None
    
    def get_statistical_tests(self):
        """Perform statistical tests for significant differences"""
        try:
            tests = {}
            
            # T-test for age between disease and no disease groups
            disease_age = self.data[self.data['target'] == 1]['age']
            no_disease_age = self.data[self.data['target'] == 0]['age']
            t_stat, p_value = stats.ttest_ind(disease_age, no_disease_age)
            
            tests['age_ttest'] = {
                'statistic': float(t_stat),
                'p_value': float(p_value),
                'significant': bool(p_value < 0.05)
            }
            
            # Chi-square test for gender and heart disease
            gender_disease = pd.crosstab(self.data['sex'], self.data['target'])
            chi2, p_value = stats.chi2_contingency(gender_disease)[:2]
            
            tests['gender_chi2'] = {
                'statistic': float(chi2),
                'p_value': float(p_value),
                'significant': bool(p_value < 0.05)
            }
            
            return tests
        except Exception as e:
            print(f"Error in get_statistical_tests: {str(e)}")
            return None
    
    def _save_plot_to_base64(self, fig):
        """Convert matplotlib figure to base64 string"""
        try:
            buf = io.BytesIO()
            fig.savefig(buf, format='png', bbox_inches='tight', dpi=300)
            plt.close(fig)
            buf.seek(0)
            return base64.b64encode(buf.getvalue()).decode('utf-8')
        except Exception as e:
            print(f"Error in _save_plot_to_base64: {str(e)}")
            return None
    
    def generate_plots(self):
        """Generate visualization plots"""
        try:
            plots = {}
            
            # Age distribution plot
            plt.clf()  # Clear any existing plots
            fig_age = plt.figure(figsize=(10, 6))
            sns.histplot(data=self.data, x='age', hue='target', bins=20)
            plt.title('Age Distribution by Heart Disease Status')
            plt.xlabel('Age')
            plt.ylabel('Count')
            plots['age_distribution'] = self._save_plot_to_base64(fig_age)
            plt.close(fig_age)
            
            # Correlation heatmap
            plt.clf()
            fig_corr = plt.figure(figsize=(10, 8))
            numeric_cols = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak', 'target']
            sns.heatmap(self.data[numeric_cols].corr(), annot=True, cmap='coolwarm', fmt='.2f')
            plt.title('Feature Correlation Heatmap')
            plots['correlation_heatmap'] = self._save_plot_to_base64(fig_corr)
            plt.close(fig_corr)
            
            # Risk by age group
            plt.clf()
            fig_risk = plt.figure(figsize=(10, 6))
            age_risk = self.data.groupby('age_group')['target'].mean() * 100
            age_risk.plot(kind='bar')
            plt.title('Heart Disease Risk by Age Group')
            plt.xlabel('Age Group')
            plt.ylabel('Risk Percentage')
            plt.xticks(rotation=45)
            plots['age_risk'] = self._save_plot_to_base64(fig_risk)
            plt.close(fig_risk)
            
            return plots
        except Exception as e:
            print(f"Error in generate_plots: {str(e)}")
            return None
