import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date, time
import os
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.host = os.getenv("EMAIL_HOST")
        self.port = int(os.getenv("EMAIL_PORT"))
        self.user = os.getenv("EMAIL_USER")
        self.password = os.getenv("EMAIL_PASSWORD")

    async def send_confirmation_email(
        self,
        destinatario_email: str,
        nombre_visitante: str,
        apellido_paterno: str,
        apellido_materno: str,
        nombre_usuario: str,
        fecha: date,
        hora: time,
        placas: str = None
    ):
        try:
            
            mensaje = MIMEMultipart("alternative")
            mensaje["Subject"] = "✅ Confirmación de Cita - Sistema de Visitas"
            mensaje["From"] = self.user
            mensaje["To"] = destinatario_email

            
            medio_ingreso = f"En vehículo (Placas: {placas})" if placas else "A pie"
            fecha_formateada = fecha.strftime("%d/%m/%Y")
            hora_formateada = hora.strftime("%H:%M")

            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                        border-radius: 10px;
                    }}
                    .header {{
                        background-color: #1e3a8a;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }}
                    .content {{
                        background-color: white;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }}
                    .info-box {{
                        background-color: #f0f7ff;
                        border-left: 4px solid #1e3a8a;
                        padding: 15px;
                        margin: 20px 0;
                    }}
                    .info-item {{
                        margin: 10px 0;
                    }}
                    .label {{
                        font-weight: bold;
                        color: #1e3a8a;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 20px;
                        color: #666;
                        font-size: 12px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Cita Confirmada</h1>
                    </div>
                    <div class="content">
                        <p>Estimado/a <strong>{nombre_visitante} {apellido_paterno} {apellido_materno}</strong>,</p>
                        
                        <p>Su cita ha sido registrada exitosamente en nuestro sistema.</p>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0; color: #1e3a8a;">Detalles de la Cita:</h3>
                            
                            <div class="info-item">
                                <span class="label">📅 Fecha:</span> {fecha_formateada}
                            </div>
                            
                            <div class="info-item">
                                <span class="label">🕐 Hora:</span> {hora_formateada}
                            </div>
                            
                            <div class="info-item">
                                <span class="label">👤 Visitará a:</span> {nombre_usuario}
                            </div>
                            
                            <div class="info-item">
                                <span class="label">🚶 Medio de ingreso:</span> {medio_ingreso}
                            </div>
                        </div>
                        
                        <p><strong>⚠️ Importante:</strong></p>
                        <ul>
                            <li>Por favor llegue 10 minutos antes de su cita</li>
                            <li>Traiga una identificación oficial vigente</li>
                            <li>Si necesita reagendar, contacte con anticipación</li>
                        </ul>
                        
                        <p>Si tiene alguna duda, no dude en contactarnos.</p>
                        
                        <p>Saludos cordiales,<br>
                        <strong>Sistema de Gestión de Visitas</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                    </div>
                </div>
            </body>
            </html>
            """

            
            parte_html = MIMEText(html_content, "html")
            mensaje.attach(parte_html)

            
            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls() 
                server.login(self.user, self.password)
                server.send_message(mensaje)

            print(f"✅ Email enviado correctamente a {destinatario_email}")
            return True

        except Exception as e:
            print(f"Error al enviar email: {str(e)}")
            return False

