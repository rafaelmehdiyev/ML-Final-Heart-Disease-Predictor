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

# Statistics API endpoints
@app.route('/api/statistics/basic', methods=['GET'])
def get_basic_statistics():
    try:
        stats = HeartDiseaseStatistics()
        return jsonify(stats.get_basic_stats())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics/risk_factors', methods=['GET'])
def get_risk_factors():
    try:
        stats = HeartDiseaseStatistics()
        return jsonify(stats.get_risk_factors())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics/correlations', methods=['GET'])
def get_correlations():
    try:
        stats = HeartDiseaseStatistics()
        return jsonify(stats.get_correlation_analysis())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics/tests', methods=['GET'])
def get_statistical_tests():
    try:
        stats = HeartDiseaseStatistics()
        return jsonify(stats.get_statistical_tests())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics/plots', methods=['GET'])
def get_plots():
    try:
        stats = HeartDiseaseStatistics()
        return jsonify(stats.generate_plots())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    load_model()
    app.run(debug=True)
