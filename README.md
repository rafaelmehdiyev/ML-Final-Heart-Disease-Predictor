# Heart Disease Prediction Model

A machine learning application that predicts the likelihood of heart disease based on various medical indicators. The model uses Support Vector Machine (SVM) algorithm to provide accurate predictions for early detection of heart disease risk.

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
│   ├── models/
│   │   ├── data/                 # Dataset directory
│   │   ├── feature_engineering.py # Feature processing
│   │   ├── retrain_model.py      # Model training script
│   │   └── fetch_datasets.py     # Data collection
│   ├── static/                   # Static web assets
│   ├── templates/                # HTML templates
│   └── app.py                    # Flask application
├── requirements.txt              # Python dependencies
└── README.md                    # This file
```

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

## Dependencies

- Flask >= 2.3.3
- NumPy >= 1.26.0
- Pandas >= 2.1.0
- Scikit-learn >= 1.3.0
- Joblib >= 1.3.2
- Matplotlib >= 3.8.0
- Requests >= 2.31.0

## Future Improvements

- Hyperparameter optimization using Grid Search
- Additional feature engineering
- Integration with external medical systems
- Support for multiple machine learning models
- Enhanced visualization of prediction explanations


## License

This project is licensed under the MIT License - see the LICENSE file for details.
