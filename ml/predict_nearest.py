# ml/predict_nearest.py
import sys
import pandas as pd
import numpy as np
import joblib
import json

def get_nearest_ngo(kitchen_lat, kitchen_lon):
    try:
        # Load model and dataset
        knn = joblib.load('ml/ngo_knn_model.pkl')
        df = pd.read_csv('ml/ngo_dataset.csv')
        
        # Format kitchen coordinates
        kitchen_coords = np.radians([[kitchen_lat, kitchen_lon]])
        
        # Predict nearest NGO
        distances, indices = knn.kneighbors(kitchen_coords)
        nearest_index = indices[0][0]
        
        # Fetch NGO details
        nearest_ngo = df.iloc[nearest_index].to_dict()
        
        # Output as JSON so Node.js can parse it easily
        print(json.dumps(nearest_ngo))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    # Receive arguments from Node.js
    k_lat = float(sys.argv[1])
    k_lon = float(sys.argv[2])
    get_nearest_ngo(k_lat, k_lon)
