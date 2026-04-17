import pandas as pd
import numpy as np
from datetime import datetime
import random

class AmazonUserDataGenerator:
    """
    Generates synthetic Amazon-like customer behavior data
    matching the exact format of the provided dataset
    """
    
    def __init__(self, batch_size=10):
        self.batch_size = batch_size
        self.customer_counter = 0
        
    def generate_batch(self):
        """Generate a batch of synthetic users"""
        
        users = []
        
        for _ in range(self.batch_size):
            self.customer_counter += 1
            
            # Generate correlated realistic data
            account_age = np.random.randint(1, 60)  # 1-60 months
            
            # TotalOrders correlates with AccountAge
            total_orders = int(np.random.gamma(2, account_age/3)) + np.random.randint(1, 10)
            
            # LastPurchaseDays (more recent for active users)
            last_purchase = np.random.choice(
                [np.random.randint(1, 15), np.random.randint(15, 60), np.random.randint(60, 250)],
                p=[0.5, 0.3, 0.2]  # 50% recent, 30% moderate, 20% churned
            )
            
            # TotalSpend correlates with TotalOrders
            avg_order_value = np.random.randint(800, 3500)
            total_spend = total_orders * avg_order_value + np.random.randint(-5000, 5000)
            total_spend = max(1000, total_spend)  # Minimum spend
            
            # AvgOrderValue
            avg_order_value_calc = int(total_spend / total_orders)
            
            # AppLogins30d (inversely correlated with LastPurchaseDays)
            if last_purchase < 15:
                app_logins = np.random.randint(10, 25)
            elif last_purchase < 60:
                app_logins = np.random.randint(3, 12)
            else:
                app_logins = np.random.randint(0, 5)
            
            # WishlistItems
            wishlist_items = np.random.randint(0, 30)
            
            # CartAbandonments (higher for churning users)
            if last_purchase > 60:
                cart_abandonments = np.random.randint(3, 10)
            else:
                cart_abandonments = np.random.randint(0, 5)
            
            # DiscountUsage
            discount_usage = np.random.choice(['Low', 'Medium', 'High'], p=[0.4, 0.35, 0.25])
            
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
        
        df = pd.DataFrame(users)
        return df
    
    def generate_with_timestamp(self):
        """Generate batch with timestamp for tracking"""
        df = self.generate_batch()
        df['GeneratedAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        return df