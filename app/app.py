from flask import Flask, render_template, request, jsonify
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib
import os
import xgboost as xgb
from models.feature_engineering import prepare_features
from models.statistics import HeartDiseaseStatistics

app = Flask(__name__)

# Initialize model and scaler as None
model = None
scaler = None

# Initialize statistics module
stats = HeartDiseaseStatistics()

# Define valid ranges for each feature
VALID_RANGES = {
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

def validate_input(data):
    """Validate input data against defined ranges"""
    errors = []
    for feature, value in data.items():
        if feature in VALID_RANGES:
            min_val, max_val = VALID_RANGES[feature]
            if not isinstance(value, (int, float)) or value < min_val or value > max_val:
                errors.append(f"{feature} must be between {min_val} and {max_val}")
    return errors

def load_model():
    global model, scaler
    try:
        # Get the absolute path to the model files
        base_path = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_path, 'models', 'heart_disease_model.pkl')
        scaler_path = os.path.join(base_path, 'models', 'scaler.pkl')
        
        print(f"Loading model from: {model_path}")
        print(f"Loading scaler from: {scaler_path}")
        
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        
        print("Model and scaler loaded successfully!")
        print(f"Model type: {type(model)}")
        
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        raise e

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/statistics')
def statistics_page():
    """Render the statistics page"""
    return render_template('statistics.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Check if model is loaded
        if model is None or scaler is None:
            try:
                load_model()
            except Exception as e:
                print(f"Error loading model: {str(e)}")
                return jsonify({
                    'status': 'error',
                    'message': 'Model not available. Please try again later.'
                }), 500
        
        print("Received form data:", request.form)
        
        # Get form data and convert to appropriate types
        try:
            data = {
                'age': int(request.form['age']),
                'sex': int(request.form['sex']),
                'cp': int(request.form['cp']),
                'trestbps': int(request.form['trestbps']),
                'chol': int(request.form['chol']),
                'fbs': int(request.form['fbs']),
                'restecg': int(request.form['restecg']),
                'thalach': int(request.form['thalach']),
                'exang': int(request.form['exang']),
                'oldpeak': float(request.form['oldpeak']),
                'slope': int(request.form['slope']),
                'ca': int(request.form['ca']),
                'thal': int(request.form['thal'])
            }
        except KeyError as ke:
            print(f"Missing form field: {str(ke)}")
            return jsonify({
                'status': 'error',
                'message': f'Missing required field: {str(ke)}'
            }), 400
        except ValueError as ve:
            print(f"Invalid value in form: {str(ve)}")
            return jsonify({
                'status': 'error',
                'message': f'Invalid value format: {str(ve)}'
            }), 400
            
        print("Parsed data:", data)
        
        # Validate input
        validation_errors = validate_input(data)
        if validation_errors:
            print("Validation errors:", validation_errors)
            return jsonify({
                'status': 'error',
                'message': 'Invalid input values: ' + '; '.join(validation_errors)
            }), 400
        
        # Engineer features
        try:
            input_df = prepare_features(data)
            print("Engineered features DataFrame:", input_df.head())
            print("Engineered features columns:", input_df.columns.tolist())
        except Exception as e:
            print(f"Error during feature engineering: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Error during feature engineering: {str(e)}'
            }), 400
        
        # Scale the input data
        try:
            # Ensure input_df has the same features as scaler expects
            scaler_features = scaler.get_feature_names_out() if hasattr(scaler, 'get_feature_names_out') else input_df.columns.tolist()
            missing_features = set(scaler_features) - set(input_df.columns)
            extra_features = set(input_df.columns) - set(scaler_features)
            
            if missing_features:
                print(f"Missing features: {missing_features}")
                for feature in missing_features:
                    input_df[feature] = 0
                    
            if extra_features:
                print(f"Extra features to be dropped: {extra_features}")
                input_df = input_df.drop(columns=list(extra_features))
                
            # Ensure columns are in the same order
            input_df = input_df[scaler_features]
            
            input_scaled = scaler.transform(input_df)
            print("Scaled input shape:", input_scaled.shape)
        except Exception as e:
            print(f"Error during scaling: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Error during data scaling: {str(e)}'
            }), 400
        
        # Make prediction
        try:
            if isinstance(model, xgb.XGBClassifier):
                probability = model.predict_proba(input_scaled)[0, 1]
            else:
                probability = model.predict_proba(input_scaled)[0, 1]
                
            prediction = int(probability > 0.5)
            print("Raw prediction:", prediction)
            print("Raw probability:", probability)
        except Exception as e:
            print(f"Error during prediction: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Error during prediction: {str(e)}'
            }), 400
        
        # Calculate risk level and confidence
        risk_level = "High" if prediction == 1 else "Low"
        confidence = probability * 100 if prediction == 1 else (1 - probability) * 100
        
        # Get feature importance information (if available)
        try:
            if hasattr(model, 'feature_importances_'):
                feature_importance = pd.DataFrame({
                    'feature': input_df.columns,
                    'importance': model.feature_importances_
                }).sort_values('importance', ascending=False)
                top_factors = feature_importance['feature'].head(3).tolist()
            else:
                top_factors = []
        except Exception as e:
            print(f"Error getting feature importance: {str(e)}")
            top_factors = []
        
        response = {
            'prediction': prediction,
            'probability': float(probability),
            'risk_level': risk_level,
            'confidence': f"{confidence:.1f}%",
            'top_risk_factors': top_factors,
            'status': 'success'
        }
        
        print("Sending response:", response)
        return jsonify(response)
        
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'An unexpected error occurred. Please try again.'
        }), 500

@app.route('/api/statistics')
def get_statistics():
    try:
        # Load the dataset
        df = pd.read_csv('app/models/data/heart_disease_combined.csv')
        
        # Basic dataset statistics
        total_patients = len(df)
        disease_count = len(df[df['target'] == 1])
        healthy_count = len(df[df['target'] == 0])
        disease_percentage = round((disease_count / total_patients) * 100, 1)
        
        # Age statistics
        mean_age = round(df['age'].mean(), 1)
        age_data = df['age'].tolist()
        diseased_ages = df[df['target'] == 1]['age'].tolist()
        
        # Gender statistics
        male_count = len(df[df['sex'] == 1])
        female_count = len(df[df['sex'] == 0])
        
        # Risk factors analysis
        def calculate_risk_percentage(df, column, labels=None):
            risk_by_category = df.groupby(column)['target'].agg(['count', 'mean']).round(3)
            risk_by_category['percentage'] = (risk_by_category['mean'] * 100).round(1)
            risk_by_category['total_count'] = risk_by_category['count']
            
            result = []
            for category in risk_by_category.index:
                label = labels.get(category, category) if labels else str(category)
                result.append({
                    'category': label,
                    'risk_percentage': float(risk_by_category.loc[category, 'percentage']),
                    'count': int(risk_by_category.loc[category, 'total_count'])
                })
            return sorted(result, key=lambda x: x['risk_percentage'], reverse=True)

        # Define labels for different features
        cp_labels = {
            0: 'Typical Angina',
            1: 'Atypical Angina',
            2: 'Non-Anginal Pain',
            3: 'Asymptomatic',
            4: 'Asymptomatic'  # Map type 4 to Asymptomatic as well
        }
        
        # Clean the chest pain types - map type 4 to type 3 (both are Asymptomatic)
        df['cp'] = df['cp'].replace(4, 3)
        
        sex_labels = {
            0: 'Female',
            1: 'Male'
        }
        
        fbs_labels = {
            0: 'Normal Fasting Blood Sugar',
            1: 'High Fasting Blood Sugar'
        }
        
        exang_labels = {
            0: 'No Exercise Angina',
            1: 'Exercise Angina'
        }
        
        # Calculate risk factors
        risk_factors = {
            'chest_pain': calculate_risk_percentage(df, 'cp', cp_labels),
            'gender': calculate_risk_percentage(df, 'sex', sex_labels),
            'fasting_blood_sugar': calculate_risk_percentage(df, 'fbs', fbs_labels),
            'exercise_angina': calculate_risk_percentage(df, 'exang', exang_labels)
        }
        
        # Calculate correlations with target
        correlations = df.corr()['target'].drop('target')
        correlations = correlations.sort_values(ascending=False)
        correlations = {k: round(float(v), 3) for k, v in correlations.items()}
        
        return jsonify({
            'status': 'success',
            'dataset_stats': {
                'total_patients': total_patients,
                'disease_count': disease_count,
                'healthy_count': healthy_count,
                'disease_percentage': disease_percentage
            },
            'age_stats': {
                'mean_age': mean_age,
                'age_data': age_data,
                'diseased_ages': diseased_ages
            },
            'gender_stats': {
                'male_count': male_count,
                'female_count': female_count
            },
            'risk_factors': risk_factors,
            'correlations': correlations
        })
        
    except Exception as e:
        print(f"Error in get_statistics: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while fetching statistics'
        }), 500

if __name__ == '__main__':
    load_model()
    app.run(debug=True)
