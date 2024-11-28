import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import requests
import io
import os

def fetch_cleveland_data():
    """Fetch the Cleveland Heart Disease dataset from UCI"""
    print("Fetching Cleveland dataset...")
    url = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Read CSV data
        data = pd.read_csv(io.StringIO(response.text), header=None)
        data.columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                       'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target']
        
        # Clean the data
        data = data.replace('?', np.nan)
        data = data.astype(float)
        data['target'] = (data['target'] > 0).astype(int)
        
        return data.dropna()
    except Exception as e:
        print(f"Error fetching Cleveland dataset: {str(e)}")
        return None

def fetch_hungarian_data():
    """Fetch the Hungarian Heart Disease dataset from UCI"""
    print("Fetching Hungarian dataset...")
    url = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.hungarian.data"
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Read CSV data
        data = pd.read_csv(io.StringIO(response.text), header=None)
        data.columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                       'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target']
        
        # Clean the data
        data = data.replace('?', np.nan)
        data = data.astype(float)
        data['target'] = (data['target'] > 0).astype(int)
        
        return data.dropna()
    except Exception as e:
        print(f"Error fetching Hungarian dataset: {str(e)}")
        return None

def fetch_switzerland_data():
    """Fetch the Switzerland Heart Disease dataset from UCI"""
    print("Fetching Switzerland dataset...")
    url = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.switzerland.data"
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Read CSV data
        data = pd.read_csv(io.StringIO(response.text), header=None)
        data.columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                       'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target']
        
        # Clean the data
        data = data.replace('?', np.nan)
        data = data.astype(float)
        data['target'] = (data['target'] > 0).astype(int)
        
        return data.dropna()
    except Exception as e:
        print(f"Error fetching Switzerland dataset: {str(e)}")
        return None

def fetch_heart_statlog():
    """Fetch the Statlog Heart Disease dataset"""
    print("Fetching Statlog Heart dataset...")
    url = "http://archive.ics.uci.edu/ml/machine-learning-databases/statlog/heart/heart.dat"
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Read space-separated data
        data = pd.read_csv(io.StringIO(response.text), sep=' ', header=None)
        data.columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                       'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target']
        
        return data
    except Exception as e:
        print(f"Error fetching Statlog dataset: {str(e)}")
        return None

def fetch_github_dataset():
    """Fetch the heart disease dataset from GitHub"""
    print("Fetching GitHub dataset...")
    url = "https://raw.githubusercontent.com/rikhuijzer/heart-disease-dataset/main/heart-disease-dataset.csv"
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Read CSV data
        data = pd.read_csv(io.StringIO(response.text))
        
        # Rename columns to match our format
        column_mapping = {
            'chest_pain_type': 'cp',
            'resting_bp_s': 'trestbps',
            'cholesterol': 'chol',
            'fasting_blood_sugar': 'fbs',
            'resting_ecg': 'restecg',
            'max_heart_rate': 'thalach',
            'exercise_angina': 'exang',
            'st_slope': 'slope'
        }
        data = data.rename(columns=column_mapping)
        
        # Add missing columns with default values
        data['ca'] = 0  # This dataset doesn't have ca information
        data['thal'] = 3  # This dataset doesn't have thal information
        
        # Ensure all columns are in the right order
        required_columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                          'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target']
        data = data[required_columns]
        
        return data
    except Exception as e:
        print(f"Error fetching GitHub dataset: {str(e)}")
        return None

def combine_datasets():
    """Combine all available heart disease datasets"""
    datasets = {
        'Cleveland': fetch_cleveland_data(),
        'Hungarian': fetch_hungarian_data(),
        'Switzerland': fetch_switzerland_data(),
        'Statlog': fetch_heart_statlog(),
        'GitHub': fetch_github_dataset()
    }
    
    # Filter out None values (failed fetches)
    datasets = {k: v for k, v in datasets.items() if v is not None}
    
    if not datasets:
        print("No datasets were successfully fetched.")
        return None
    
    # Print shape of each dataset
    for name, data in datasets.items():
        print(f"{name} dataset shape: {data.shape}")
    
    # Combine all datasets
    combined_data = pd.concat(datasets.values(), ignore_index=True)
    print(f"\nCombined dataset shape: {combined_data.shape}")
    
    # Remove duplicates
    combined_data = combined_data.drop_duplicates()
    print(f"Dataset shape after removing duplicates: {combined_data.shape}")
    
    return combined_data

def clean_dataset(data):
    """Clean and validate the combined dataset"""
    # Define valid ranges for each feature
    valid_ranges = {
        'age': (20, 100),
        'sex': (0, 1),
        'cp': (0, 3),
        'trestbps': (80, 200),
        'chol': (100, 600),
        'fbs': (0, 1),
        'restecg': (0, 2),
        'thalach': (60, 220),
        'exang': (0, 1),
        'oldpeak': (0, 6.2),
        'slope': (0, 2),
        'ca': (0, 3),
        'thal': (1, 3)
    }
    
    # Filter rows based on valid ranges
    for column, (min_val, max_val) in valid_ranges.items():
        data = data[data[column].between(min_val, max_val)]
    
    return data

def save_dataset():
    """Fetch, combine, and save the dataset"""
    # Create data directory if it doesn't exist
    os.makedirs(os.path.join('data'), exist_ok=True)
    
    # Get combined dataset
    combined_data = combine_datasets()
    
    if combined_data is not None:
        # Save to CSV
        output_path = os.path.join('data', 'heart_disease_combined.csv')
        combined_data.to_csv(output_path, index=False)
        print(f"\nDataset saved to {output_path}")
        print(f"Total number of samples: {len(combined_data)}")
        print(f"Number of positive cases: {combined_data['target'].sum()}")
        print(f"Number of negative cases: {len(combined_data) - combined_data['target'].sum()}")
        
        # Display data distribution
        print("\nData Distribution:")
        for column in combined_data.columns:
            print(f"\n{column}:")
            print(combined_data[column].describe())
    else:
        print("Failed to create combined dataset")

if __name__ == "__main__":
    save_dataset()
