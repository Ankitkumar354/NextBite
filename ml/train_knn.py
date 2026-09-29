# ml/train_knn.py
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
import joblib

# 1. Create Dummy NGO Data (Kanpur coordinates)
data = {
    'ngo_id': [101, 102, 103, 104, 105],
    'name': ['Hope Foundation', 'Food Bank India', 'Shelter Care', 'Community Kitchen', 'Annapurna NGO'],
    'lat': [26.4499, 26.4520, 26.4600, 26.4300, 26.4800], 
    'lon': [80.3319, 80.3200, 80.3500, 80.3100, 80.3600],
    'capacity_kg': [50, 200, 100, 30, 150]
}

df = pd.DataFrame(data)
df.to_csv('ngo_dataset.csv', index=False)
print("Dummy dataset 'ngo_dataset.csv' created.")

# 2. Train the K-Nearest Neighbors Model
# We use Haversine metric to accurately calculate distances on a sphere (Earth)
X = np.radians(df[['lat', 'lon']]) 
knn = NearestNeighbors(n_neighbors=1, algorithm='ball_tree', metric='haversine')
knn.fit(X)

# 3. Save the trained model
joblib.dump(knn, 'ngo_knn_model.pkl')
print("KNN Model trained and saved as 'ngo_knn_model.pkl'.")