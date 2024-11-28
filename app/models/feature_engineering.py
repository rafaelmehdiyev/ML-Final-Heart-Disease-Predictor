import pandas as pd
import numpy as np

def engineer_features(data):
    """Create new features from existing ones"""
    # Create a copy to avoid modifying the original data
    df = data.copy()
    
    # Fill missing values with medians
    numeric_columns = ['age', 'trestbps', 'chol', 'thalach']
    for col in numeric_columns:
        df[col] = df[col].fillna(df[col].median())
    
    # BMI approximation using blood pressure (rough estimate)
    df['bmi_approx'] = df['trestbps'] / 2
    
    # Age-related features
    df['age_squared'] = df['age'] ** 2
    df['age_group'] = pd.cut(df['age'], bins=[0, 40, 50, 60, 100], labels=[0, 1, 2, 3])
    df['age_group'] = df['age_group'].cat.add_categories(-1).fillna(-1).astype(int)
    
    # Blood pressure features
    df['bp_category'] = pd.cut(df['trestbps'], bins=[0, 120, 140, 160, 200], labels=[0, 1, 2, 3])
    df['bp_category'] = df['bp_category'].cat.add_categories(-1).fillna(-1).astype(int)
    df['pulse_pressure'] = df['trestbps'] - 70  # Approximate diastolic
    
    # Cholesterol-related features
    df['chol_category'] = pd.cut(df['chol'], bins=[0, 200, 240, 300, 600], labels=[0, 1, 2, 3])
    df['chol_category'] = df['chol_category'].cat.add_categories(-1).fillna(-1).astype(int)
    df['chol_ratio'] = df['chol'] / 200  # Ratio to normal cholesterol
    
    # Heart rate and exercise features
    df['heart_reserve'] = 220 - df['age'] - df['thalach']
    df['exercise_intensity'] = df['thalach'] / (220 - df['age'])
    
    # Interaction features
    df['age_bp'] = df['age'] * df['trestbps'] / 100
    df['age_chol'] = df['age'] * df['chol'] / 100
    df['bp_chol'] = df['trestbps'] * df['chol'] / 1000
    
    # Risk factor combinations
    df['risk_factors'] = (
        (df['age'] > 50).astype(int) +
        (df['trestbps'] > 140).astype(int) +
        (df['chol'] > 240).astype(int) +
        df['fbs'] +
        (df['thalach'] < 150).astype(int)
    )
    
    return df

def prepare_features(data):
    """Prepare a single sample or batch of data for prediction"""
    # Convert to DataFrame if dict
    if isinstance(data, dict):
        data = pd.DataFrame([data])
    
    # Engineer features
    df = engineer_features(data)
    
    # Ensure all required features are present and in correct order
    required_features = [
        'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach',
        'exang', 'oldpeak', 'slope', 'ca', 'thal', 'bmi_approx', 'age_squared',
        'age_group', 'bp_category', 'pulse_pressure', 'chol_category', 'chol_ratio',
        'heart_reserve', 'exercise_intensity', 'age_bp', 'age_chol', 'bp_chol',
        'risk_factors'
    ]
    
    # Add any missing columns with default value 0
    for feature in required_features:
        if feature not in df.columns:
            df[feature] = 0
    
    # Return only required features in correct order
    return df[required_features]
