import pandas as pd
import numpy as np
from datetime import datetime
import os
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# ================= PATH SETUP =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_PATH = os.path.join(BASE_DIR, "/Users/ayushchhetry/data/raw/customer_data.csv")
PROCESSED_PATH = os.path.join(BASE_DIR, "data/processed/customer_processed.csv")

os.makedirs(os.path.dirname(PROCESSED_PATH), exist_ok=True)

# ================= LOAD DATA =================
def load_data():
    if not os.path.exists(RAW_PATH):
        print("❌ No raw data found")
        return None
    return pd.read_csv(RAW_PATH)

# ================= FEATURE ENGINEERING =================
def feature_engineering(df):
    df['Recency'] = df['LastPurchaseDays']
    df['Frequency'] = df['TotalOrders']
    df['Monetary'] = df['TotalSpend']

    # Engagement Score
    df['EngagementScore'] = (
        df['AppLogins30d'] * 0.4 +
        df['WishlistItems'] * 0.2 +
        (10 - df['CartAbandonments']) * 0.4
    )

    return df

# ================= SEGMENTATION =================
def apply_kmeans(df):
    features = df[['Recency', 'Frequency', 'Monetary']]

    scaler = StandardScaler()
    scaled = scaler.fit_transform(features)

    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    df['Segment'] = kmeans.fit_predict(scaled)

    return df

# ================= CHURN PREDICTION =================
def churn_prediction(df):
    conditions = [
        (df['Recency'] > 90) & (df['Frequency'] < 5),
        (df['Recency'] > 30),
        (df['Recency'] <= 30)
    ]

    choices = ['High', 'Medium', 'Low']
    df['ChurnRisk'] = np.select(conditions, choices, default='Low')

    return df

# ================= CLV =================
def calculate_clv(df):
    df['CLV'] = df['Monetary'] * df['Frequency']
    return df

# ================= DECISION ENGINE =================
def decision_engine(df):
    def action(row):
        if row['ChurnRisk'] == 'High':
            return 'Retention Campaign'
        elif row['Segment'] == 2:
            return 'Loyalty Program'
        elif row['CLV'] > 50000:
            return 'VIP Treatment'
        else:
            return 'Regular Engagement'

    df['RecommendedAction'] = df.apply(action, axis=1)
    return df

# ================= SAVE =================
def save_data(df):
    df['ProcessedAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    df.to_csv(PROCESSED_PATH, index=False)
    print(f"✅ Processed data saved to {PROCESSED_PATH}")

# ================= MAIN =================
def run_pipeline():
    df = load_data()
    if df is None:
        return

    df = feature_engineering(df)
    df = apply_kmeans(df)
    df = churn_prediction(df)
    df = calculate_clv(df)
    df = decision_engine(df)

    save_data(df)

if __name__ == "__main__":
    run_pipeline()