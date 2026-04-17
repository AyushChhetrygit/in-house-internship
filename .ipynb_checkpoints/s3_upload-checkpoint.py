import boto3
from botocore.exceptions import ClientError
import pandas as pd
from datetime import datetime
import config
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class S3Uploader:
    """Handle all S3 upload operations"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=config.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
            region_name=config.AWS_REGION
        )
        self.bucket = config.S3_BUCKET_NAME
        self.raw_prefix = config.S3_RAW_PREFIX
        
    def upload_dataframe(self, df, filename=None):
        """
        Upload DataFrame to S3 as CSV
        
        Args:
            df: pandas DataFrame
            filename: Optional custom filename (auto-generated if None)
        """
        
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'amazon_users_batch_{timestamp}.csv'
        
        # Convert DataFrame to CSV
        csv_buffer = df.to_csv(index=False)
        
        # Full S3 key
        s3_key = f'{self.raw_prefix}{filename}'
        
        try:
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=s3_key,
                Body=csv_buffer,
                ContentType='text/csv'
            )
            logger.info(f"✅ Uploaded to s3://{self.bucket}/{s3_key}")
            return s3_key
            
        except ClientError as e:
            logger.error(f"❌ Upload failed: {e}")
            raise
    
    def append_to_master_file(self, df, master_filename='amazon_users_raw.csv'):
        """
        Append new data to a master CSV file in S3
        Downloads existing, appends, and re-uploads
        """
        
        s3_key = f'{self.raw_prefix}{master_filename}'
        
        try:
            # Try to download existing file
            obj = self.s3_client.get_object(Bucket=self.bucket, Key=s3_key)
            existing_df = pd.read_csv(obj['Body'])
            logger.info(f"📥 Downloaded existing file: {len(existing_df)} rows")
            
            # Append new data
            combined_df = pd.concat([existing_df, df], ignore_index=True)
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                logger.info("📝 No existing file found. Creating new master file.")
                combined_df = df
            else:
                raise
        
        # Upload combined data
        csv_buffer = combined_df.to_csv(index=False)
        
        self.s3_client.put_object(
            Bucket=self.bucket,
            Key=s3_key,
            Body=csv_buffer,
            ContentType='text/csv'
        )
        
        logger.info(f"✅ Master file updated: {len(combined_df)} total rows")
        return s3_key
    
    def test_connection(self):
        """Test S3 connection"""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket)
            logger.info(f"✅ Connected to S3 bucket: {self.bucket}")
            return True
        except ClientError:
            logger.error(f"❌ Cannot access bucket: {self.bucket}")
            return False