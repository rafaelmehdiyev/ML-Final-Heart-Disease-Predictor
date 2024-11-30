# Heart Disease Predictor - Technical Architecture Documentation

## 1. Project Structure Overview

```
app/
├── app.py                 # Main Flask application
├── models/               # Machine Learning components
│   ├── data/            # Dataset storage
│   ├── feature_engineering.py
│   ├── fetch_datasets.py
│   ├── retrain_model.py
│   ├── statistics.py
│   ├── heart_disease_model.pkl
│   └── scaler.pkl
├── static/              # Static assets
│   ├── css/            # Stylesheets
│   └── js/             # JavaScript files
└── templates/          # HTML templates
    ├── index.html
    ├── ml_process.html
    └── statistics.html
```

## 2. Component Relationships

### 2.1 Dataset Overview
- **Total Patients**: 1,371
- **Disease Distribution**:
  * Patients with Heart Disease: 903 (65.9%)
  * Patients without Heart Disease: 468 (34.1%)
- **Data Characteristics**:
  * Balanced through class weights
  * Stratified sampling for fair evaluation
  * Representative of clinical scenarios

### 2.2 Core Application Flow
- `app.py` serves as the central hub, coordinating all components:
  - Handles HTTP routes and API endpoints
  - Manages model predictions
  - Coordinates data flow between frontend and backend
  - Integrates with ML model components

### 2.3 Machine Learning Pipeline
1. **Data Management**
   - `fetch_datasets.py`: Handles dataset retrieval and preprocessing
   - `data/`: Stores the heart disease dataset
   - `feature_engineering.py`: Implements feature transformations

2. **Model Components**
   - `heart_disease_model.pkl`: Serialized SVM model
   - `scaler.pkl`: StandardScaler for feature normalization
   - `retrain_model.py`: Model training and evaluation scripts

3. **Statistical Analysis**
   - `statistics.py`: Computes dataset statistics and risk factors
   - Generates correlation analysis and feature importance

### 2.4 Frontend Architecture
1. **Templates**
   - `index.html`: Main application interface
     - Prediction form
     - Results display
     - About section
   - `ml_process.html`: ML process visualization
     - Model performance metrics
     - Feature importance plots
     - Training process explanation
   - `statistics.html`: Statistical analysis interface

2. **Static Assets**
   - JavaScript modules
     - Form handling
     - Data visualization
     - Language translations
   - CSS styles for responsive design

## 3. Data Flow

### 3.1 Prediction Flow
1. User input → Frontend validation
2. AJAX request → `/predict` endpoint
3. Feature preprocessing
4. Model prediction
5. Response formatting
6. Result visualization

### 3.2 ML Process Visualization
1. Model metrics computation
2. Performance visualization
3. Feature importance analysis
4. Interactive charts rendering

## 4. Key Features Implementation

### 4.1 Machine Learning Model
- Algorithm: Support Vector Machine (SVM)
- Kernel: Radial Basis Function (RBF)
- Performance:
  - Accuracy: 78.18%
  - ROC AUC: 86.92%
  - Cross-validation: 84.24% (±2.20%)

### 4.2 Feature Engineering
- Standardization of numerical features
- Custom feature creation:
  - Age groups
  - Blood pressure categories
  - Heart rate reserve
  - Exercise intensity metrics

### 4.3 Frontend Features
1. **Interactive Form**
   - Real-time validation
   - Dynamic UI updates
   - Multilingual support

2. **Visualization Components**
   - Confusion Matrix
   - ROC Curve
   - Feature Importance Plot

3. **Responsive Design**
   - Bootstrap 5 framework
   - Mobile-first approach
   - Accessible UI components

## 5. API Endpoints

### 5.1 Main Routes
- `/` (GET): Home page
- `/ml-process` (GET): ML process visualization
- `/predict` (POST): Model predictions

### 5.2 API Endpoints
- `/api/statistics`: Dataset statistics and analysis

## 6. Dependencies and Technologies

### 6.1 Backend
- Flask (v2.3.3)
- NumPy (v1.26.0)
- Pandas (v2.1.0)
- Scikit-learn (v1.3.0)
- Joblib (v1.3.2)

### 6.2 Frontend
- Bootstrap 5
- Font Awesome
- Chart.js
- Plotly.js
- Custom JavaScript modules

## 7. Security Considerations

### 7.1 Input Validation
- Client-side form validation
- Server-side data sanitization
- Type checking and range validation

### 7.2 Error Handling
- Graceful error recovery
- User-friendly error messages
- Logging and monitoring

## 8. Performance Optimization

### 8.1 Model Optimization
- Feature selection
- Model parameter tuning
- Efficient prediction pipeline

### 8.2 Application Optimization
- Static asset caching
- Asynchronous data loading
- Efficient database queries

## 9. Future Enhancements

### 9.1 Planned Features
- Enhanced visualization options
- Additional language support
- Advanced risk factor analysis

### 9.2 Technical Improvements
- Model retraining pipeline
- Performance monitoring
- Extended API functionality

## 10. Development Workflow

### 10.1 Version Control
- Feature branching
- Version tagging
- Deployment workflow

### 10.2 Testing
- Unit tests for ML components
- Integration tests for API
- Frontend testing suite

## 11. Deployment

### 11.1 Requirements
- Python 3.8+
- pip package manager
- Virtual environment setup

### 11.2 Configuration
- Environment variables
- Logging setup
- Debug/Production modes
