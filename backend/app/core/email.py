import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .config import settings


async def send_email(to_email: str, subject: str, html_body: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"Email skipped (SMTP not configured): {subject} -> {to_email}")
        return False

    message = MIMEMultipart("alternative")
    message["From"] = settings.FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = subject
    message.attach(MIMEText(html_body, "html"))

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            start_tls=True,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
        )
        return True
    except Exception as e:
        print(f"Email send failed: {e}")
        return False


async def send_welcome_email(email: str, name: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #78350f; padding: 30px; text-align: center;">
            <h1 style="color: #d97706; margin: 0;">SoilSense</h1>
            <p style="color: #fbbf24;">Soil Quality Analyzer</p>
        </div>
        <div style="padding: 30px; background: #fffbeb;">
            <h2 style="color: #78350f;">Welcome, {name}!</h2>
            <p style="color: #92400e;">Your SoilSense account is ready. Upload soil photos to get AI-powered analysis including soil type, moisture levels, pH estimates, and crop recommendations.</p>
            <ul style="color: #92400e;">
                <li>Soil type classification (7 types)</li>
                <li>Moisture and pH estimation</li>
                <li>Crop compatibility recommendations</li>
                <li>Fertilizer suggestions</li>
            </ul>
        </div>
        <div style="background: #78350f; padding: 20px; text-align: center;">
            <p style="color: #a16207; font-size: 12px;">Humanoid Maker - www.humanoidmaker.com</p>
        </div>
    </div>
    """
    await send_email(email, "Welcome to SoilSense", html)


async def send_password_reset_email(email: str, reset_token: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #78350f; padding: 30px; text-align: center;">
            <h1 style="color: #d97706;">SoilSense</h1>
        </div>
        <div style="padding: 30px; background: #fffbeb;">
            <h2 style="color: #78350f;">Password Reset</h2>
            <p style="color: #92400e;">Use this code to reset your password:</p>
            <div style="background: #78350f; color: #d97706; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 4px; border-radius: 8px;">
                {reset_token}
            </div>
            <p style="color: #a16207; font-size: 12px; margin-top: 20px;">This code expires in 1 hour.</p>
        </div>
    </div>
    """
    await send_email(email, "SoilSense - Password Reset", html)
