import pandas as pd
import os
from typing import List, Dict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "processed", "customer_processed.csv")

def get_customers_by_segment(segment_name: str) -> List[Dict]:
    """
    Reads the processed CSV and filters customers by segment logic.
    segment_name maps to different business rules:
      - 'VIP': Segment == 2 or CLV > 50000 or Recommendation == 'VIP Treatment'
      - 'At-Risk': ChurnRisk == 'High'
      - 'Inactive': Recency > 90
      - 'New': AccountAgeMonths < 6
    """
    if not os.path.exists(CSV_PATH):
        return []

    df = pd.read_csv(CSV_PATH)

    if segment_name.lower() == "vip":
        filtered = df[(df['Segment'] == 2) | (df['CLV'] > 50000) | (df['RecommendedAction'] == 'VIP Treatment')]
    elif segment_name.lower() in ["at-risk", "atrisk"]:
        filtered = df[df['ChurnRisk'] == 'High']
    elif segment_name.lower() == "inactive":
        filtered = df[df['Recency'] > 90]
    elif segment_name.lower() == "new":
        filtered = df[df['AccountAgeMonths'] <= 6]
    else:
        filtered = df.head(0) # Empty match fallback

    # Take top 500 to prevent massive memory usage in local dev
    filtered = filtered.head(500)

    customers = []
    for _, row in filtered.iterrows():
        customer_id = row['CustomerID']
        
        # We synthesize an email and name since the dataset only contains CustomerID
        email_prefix = customer_id.lower().replace('c', 'customer')
        email = f"{email_prefix}@demo.local"
        name = f"User {customer_id}"

        customers.append({
            "customer_id": customer_id,
            "name": name,
            "email": email,
            "segment_name": segment_name.upper(),
            "churn_risk": str(row.get('ChurnRisk', 'Low')),
            "attributes": {
                "Recency": int(row.get('Recency', 0)),
                "TotalSpend": float(row.get('TotalSpend', 0.0)),
                "CLV": float(row.get('CLV', 0.0)),
                "RecommendedAction": str(row.get('RecommendedAction', ''))
            }
        })

    return customers

# For quick testing
if __name__ == "__main__":
    print(len(get_customers_by_segment("VIP")))
