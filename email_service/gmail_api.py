import os
import base64
from email.message import EmailMessage
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import logging

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

logger = logging.getLogger(__name__)

class GmailClient:
    def __init__(self, token_path='token.json', credentials_path='credentials-gmail.json'):
        self.creds = None
        self.token_path = token_path
        self.credentials_path = credentials_path
        
        # Load existing token
        if os.path.exists(self.token_path):
            self.creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
            
        # Refresh or fetch new
        if not self.creds or not self.creds.valid:
            self._authenticate()

        # Build service
        if self.creds and self.creds.valid:
            self.service = build('gmail', 'v1', credentials=self.creds)
        else:
            self.service = None

    def _authenticate(self):
        if self.creds and self.creds.expired and self.creds.refresh_token:
            self.creds.refresh(Request())
        else:
            if not os.path.exists(self.credentials_path):
                logger.warning(f"Credentials missing. Cannot init Gmail OAuth: {self.credentials_path}")
                return
            flow = InstalledAppFlow.from_client_secrets_file(self.credentials_path, SCOPES)
            # This requires a local browser - safe for dev mode, but for prod you'd use a generated token
            self.creds = flow.run_local_server(port=0)
            
        with open(self.token_path, 'w') as token:
            token.write(self.creds.to_json())

    def send_email(self, to: str, subject: str, html_body: str) -> bool:
        """
        Sends an email using the Gmail API
        """
        if not self.service:
            logger.error("Gmail Service not initialized (Missing credentials).")
            return False

        try:
            message = EmailMessage()
            message.set_content("Please enable HTML to view this message.")
            message.add_alternative(html_body, subtype='html')

            message['To'] = to
            message['From'] = 'me' # special keyword for authenticated user
            message['Subject'] = subject

            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            create_message = {'raw': encoded_message}

            send_message = (self.service.users().messages().send(userId="me", body=create_message).execute())
            logger.info(f"Message Id: {send_message['id']} successfully sent to {to}")
            return True
        except Exception as error:
            logger.error(f"Failed to send email: {error}")
            return False

# Singleton instance initialized lazily
_client = None

def get_gmail_client():
    global _client
    if _client is None:
        try:
            _client = GmailClient()
        except Exception as e:
            logger.error(f"Could not load Gmail client: {e}")
    return _client
