import pandas as pd
import numpy as np
from datetime import datetime
import os

class AmazonUserDataGenerator:

    def __init__(self, batch_size=10, output_path="data/raw/customer_data.csv"):
        self.batch_size = batch_size
        self.output_path = output_path
        self.customer_counter = self.get_last_customer_id()

    def get_last_customer_id(self):
        """Read last CustomerID from CSV to continue sequence"""
        if os.path.exists(self.output_path):
            try:
                df = pd.read_csv(self.output_path)
                if not df.empty:
                    last_id = df['CustomerID'].iloc[-1]
                    return int(last_id.replace('C', ''))
            except:
                pass
        return 0

    def generate_batch(self):
        users = []

        for _ in range(self.batch_size):
            self.customer_counter += 1

            account_age = np.random.randint(1, 60)

            total_orders = int(np.random.gamma(2, account_age / 3)) + np.random.randint(1, 10)
            total_orders = max(1, total_orders)

            last_purchase = np.random.choice(
                [np.random.randint(1, 15), np.random.randint(15, 60), np.random.randint(60, 250)],
                p=[0.5, 0.3, 0.2]
            )

            avg_order_value = np.random.randint(800, 3500)
            noise = np.random.randint(-2000, 2000)
            total_spend = max(1000, total_orders * avg_order_value + noise)

            avg_order_value_calc = int(total_spend / total_orders)

            if last_purchase < 15:
                app_logins = np.random.randint(10, 25)
            elif last_purchase < 60:
                app_logins = np.random.randint(3, 12)
            else:
                app_logins = np.random.randint(0, 5)

            wishlist_items = np.random.randint(0, 30)

            if last_purchase > 60:
                cart_abandonments = np.random.randint(3, 10)
            else:
                cart_abandonments = np.random.randint(0, 5)

            discount_usage = np.random.choice(
                ['Low', 'Medium', 'High'],
                p=[0.4, 0.35, 0.25]
            )

            user = {
                'CustomerID': f'C{self.customer_counter:05d}',
                'AccountAgeMonths': account_age,
                'LastPurchaseDays': last_purchase,
                'TotalOrders': total_orders,
                'TotalSpend': total_spend,
                'AvgOrderValue': avg_order_value_calc,
                'AppLogins30d': app_logins,
                'WishlistItems': wishlist_items,
                'CartAbandonments': cart_abandonments,
                'DiscountUsage': discount_usage
            }

            users.append(user)

        return pd.DataFrame(users)

    def generate_with_timestamp(self):
        df = self.generate_batch()
        df['GeneratedAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        return df


# ================= RUN SCRIPT =================

if __name__ == "__main__":
    generator = AmazonUserDataGenerator(batch_size=10)
    df = generator.generate_with_timestamp()

    print(df.head())

    # Save to local storage
    output_path = "data/raw/customer_data.csv"
    os.makedirs("data/raw", exist_ok=True)

    if os.path.exists(output_path):
        df.to_csv(output_path, mode='a', header=False, index=False)
    else:
        df.to_csv(output_path, index=False)

    print(f"\n✅ Data saved to {output_path}")