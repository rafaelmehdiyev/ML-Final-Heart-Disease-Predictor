import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from sklearn.svm import SVC
from sklearn.utils.class_weight import compute_class_weight
import joblib
import os
from feature_engineering import prepare_features

def load_and_preprocess_data():
    """Load and preprocess the combined heart disease dataset"""
    data_path = os.path.join('app', 'models', 'data', 'heart_disease_combined.csv')
    data = pd.read_csv(data_path)
    
    # Convert target to binary (0: no disease, 1: has disease)
    data['target'] = (data['target'] > 0).astype(int)
    
    # Apply feature engineering
    data_engineered = prepare_features(data)
    
    # Separate features and target
    X = data_engineered
    y = data['target']
    
    # Calculate class weights
    class_weights = compute_class_weight('balanced', classes=np.unique(y), y=y)
    class_weight_dict = dict(zip(np.unique(y), class_weights))
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Convert back to DataFrame to preserve column names
    X_train_scaled = pd.DataFrame(X_train_scaled, columns=X_train.columns)
    X_test_scaled = pd.DataFrame(X_test_scaled, columns=X_test.columns)
    
    # Save the scaler for future predictions
    joblib.dump(scaler, os.path.join('app', 'models', 'scaler.pkl'))
    
    return X_train_scaled, X_test_scaled, y_train, y_test, class_weight_dict

def train_model(X_train, y_train, class_weight_dict):
    """Train SVM model with optimized parameters"""
    model = SVC(
        kernel='rbf',  # Radial Basis Function kernel
        C=1.0,         # Regularization parameter
        gamma='scale', # Kernel coefficient
        probability=True,  # Enable probability estimates
        class_weight=class_weight_dict,
        random_state=42
    )
    
    # Train the model
    print("Training SVM model... This might take a few minutes...")
    model.fit(X_train, y_train)
    
    return model

def evaluate_model(model, X_test, y_test):
    """Evaluate the model's performance"""
    # Make predictions
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]  # Probability of positive class
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    
    # Print detailed classification report
    print("\nModel Performance Metrics:")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"ROC AUC: {roc_auc:.4f}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred))
    
    return accuracy, roc_auc

def main():
    print("Loading and preprocessing data...")
    X_train, X_test, y_train, y_test, class_weight_dict = load_and_preprocess_data()
    
    print("\nTraining model...")
    model = train_model(X_train, y_train, class_weight_dict)
    
    print("\nEvaluating model...")
    accuracy, roc_auc = evaluate_model(model, X_test, y_test)
    
    # Save the model
    model_path = os.path.join('app', 'models', 'heart_disease_model.pkl')
    joblib.dump(model, model_path)
    print(f"\nModel saved to {model_path}")
    
    # Perform cross-validation
    print("\nPerforming 5-fold cross-validation...")
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc')
    print(f"Cross-validation ROC AUC scores: {cv_scores}")
    print(f"Mean CV ROC AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

if __name__ == "__main__":
    main()
