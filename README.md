# Heart Disease Prediction Model

A machine learning application that predicts the likelihood of heart disease based on various medical indicators. The model uses Support Vector Machine (SVM) algorithm to provide accurate predictions for early detection of heart disease risk.

## Project Overview

### Objective
This project aims to develop a machine learning system that can predict the likelihood of heart disease in patients using medical indicators. The goal is to assist healthcare professionals in early detection and risk assessment, potentially leading to better preventive care and treatment outcomes.

### Problem Statement
Heart disease remains one of the leading causes of mortality worldwide. Early detection is crucial but complex due to the multiple factors involved. This project addresses this challenge by creating an accurate, accessible tool for heart disease risk assessment.

## Features

- Heart disease prediction using medical indicators
- Interactive web interface for data input
- Real-time predictions with probability scores
- Statistical analysis and visualizations
- Model performance metrics and validation
- Support for continuous learning with new data

## Technical Details

### Model Architecture
- Algorithm: Support Vector Machine (SVM)
- Kernel: Radial Basis Function (RBF)
- Features: Engineered from medical indicators including age, blood pressure, cholesterol, etc.
- Performance:
  - Accuracy: 78.18%
  - ROC AUC: 86.92%
  - Cross-validation ROC AUC: 84.24% (±2.20%)

### Feature Engineering
- Standardized numerical features
- Categorical encoding for discrete variables
- Custom feature creation:
  - Age groups
  - Blood pressure categories
  - Cholesterol level categories
  - Heart rate reserve
  - Exercise intensity metrics

### Data Processing
- Automated data cleaning and preprocessing
- Missing value handling
- Feature scaling using StandardScaler
- Class imbalance handling using balanced weights

## Project Structure and Components

### Core Files and Their Functions:

1. **Application Core** (`app/app.py`):
   - Flask web application
   - Routes handling
   - Model inference
   - Real-time prediction processing

2. **Machine Learning Components** (`app/models/`):
   - `heart_disease_model.pkl`: Trained SVM model
   - `scaler.pkl`: Feature standardization parameters
   - `feature_engineering.py`: Feature transformation logic
   - `statistics.py`: Statistical analysis and metrics

3. **Web Interface** (`app/templates/`):
   - `index.html`: Main application interface
     - Medical parameter input forms
     - Real-time prediction display
     - Statistical visualizations
   - `ml_process.html`: ML process explanation
   - `prediction_process.html`: Visual process demonstration

4. **Frontend Assets** (`app/static/`):
   - CSS styling (`style.css`)
   - JavaScript functionality (`main.js`)
   - Internationalization support (`translations.js`)

## Key Features and Capabilities

1. **Prediction Interface**:
   - Comprehensive medical parameter input
   - Real-time validation
   - Instant risk assessment

2. **Visualization Components**:
   - Risk probability scores
   - Feature importance analysis
   - Statistical insights
   - Process visualization

3. **Educational Elements**:
   - ML process explanation
   - Medical parameter information
   - Risk factor analysis

## Installation

1. Clone the repository
2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Start the Flask application:
```bash
python app/app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

3. Enter patient medical data in the web interface to get predictions

## Project Structure

```
Final Project/
├── app/
│   ├── app.py                    # Main Flask application (18.5 KB)
│   ├── models/
│   │   ├── data/                # Dataset directory
│   │   ├── feature_engineering.py # Feature processing (2.9 KB)
│   │   ├── heart_disease_model.pkl # Trained model (140.7 KB)
│   │   ├── retrain_model.py     # Model training script (3.8 KB)
│   │   ├── scaler.pkl          # Feature scaler (1.9 KB)
│   │   └── statistics.py       # Statistical analysis (8.8 KB)
│   ├── static/
│   │   ├── css/                # Stylesheet directory
│   │   └── js/                 # JavaScript files
│   └── templates/
│       ├── error.html          # Error page template (0.7 KB)
│       ├── index.html          # Main application page (29.6 KB)
│       ├── ml_process.html     # ML explanation page (16.0 KB)
│       └── prediction_process.html # Prediction visualization (16.1 KB)
├── requirements.txt            # Python dependencies
└── README.md                  # Project documentation
```

## Dependencies

Core Dependencies:
- Flask >= 2.3.3 (Web framework)
- NumPy >= 1.26.0 (Numerical computations)
- Pandas >= 2.1.0 (Data manipulation)
- Scikit-learn >= 1.3.0 (Machine learning)
- Joblib >= 1.3.2 (Model serialization)
- Matplotlib >= 3.8.0 (Static plotting)
- Requests >= 2.31.0 (HTTP requests)

Additional Dependencies:
- Plotly >= 5.18.0 (Interactive visualizations)
- Gunicorn >= 21.2.0 (Production WSGI server)
- Python-dotenv >= 1.0.0 (Environment management)
- Flask-WTF >= 1.2.1 (Form handling)
- Werkzeug >= 3.0.1 (WSGI utilities)

## Model Performance Details

### Classification Report
```
              precision    recall  f1-score   support
           0       0.64      0.82      0.72        94
           1       0.89      0.76      0.82       181
    accuracy                           0.78       275
   macro avg       0.77      0.79      0.77       275
weighted avg       0.81      0.78      0.79       275
```

### Key Metrics
- High precision (89%) for positive cases (heart disease)
- Good recall (82%) for negative cases (healthy)
- Balanced performance across classes
- Robust cross-validation scores showing model stability

## Author
Rafael Mehdiyev
Baku Higher Oil School

