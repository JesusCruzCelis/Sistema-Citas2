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
        area: str,
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
                                <span class="label">🏢 Área:</span> {area}
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

                        <div class="contact-box" style="background-color: #f0f7ff; border: 2px solid #1e3a8a; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center;">
                            <p><strong>📞 ¿Tiene alguna duda?</strong></p>
                            <p>Contáctenos al: <strong style="color: #1e3a8a; font-size: 18px;">951 458 1314</strong></p>
                        </div>
                        
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
        
    async def send_reset_password_email(self, destinatario_email: str):
        """
        Envía un correo con el enlace para restablecer la contraseña.
        """
        try:
            # URL de tu componente ResetPassword (frontend)
            reset_link = f"http://localhost:5173/reset-password?email={destinatario_email}"

            # Crear mensaje
            mensaje = MIMEMultipart("alternative")
            mensaje["Subject"] = "🔒 Restablecer tu contraseña - Sistema de Visitas"
            mensaje["From"] = self.user
            mensaje["To"] = destinatario_email

            # HTML del correo
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        background-color: #f9f9f9;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 20px auto;
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }}
                    .header {{
                        background-color: #1e3a8a;
                        color: white;
                        text-align: center;
                        padding: 20px;
                    }}
                    .content {{
                        padding: 30px;
                    }}
                    .btn {{
                        display: inline-block;
                        background-color: #facc15;
                        color: black;
                        text-decoration: none;
                        padding: 12px 25px;
                        border-radius: 8px;
                        font-weight: bold;
                        margin-top: 20px;
                    }}
                    .footer {{
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                        margin: 20px 0;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🔒 Restablecer Contraseña</h2>
                    </div>
                    <div class="content">
                        <p>Hola,</p>
                        <p>Recibimos una solicitud para restablecer tu contraseña en el <strong>Sistema de Visitas</strong>.</p>
                        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>

                        <div style="text-align:center;">
                            <a href="{reset_link}" class="btn">Restablecer Contraseña</a>
                        </div>

                        <p>Si tú no solicitaste este cambio, puedes ignorar este mensaje.</p>

                        <p>Este enlace te llevará a la página de restablecimiento donde podrás ingresar una nueva contraseña.</p>
                    </div>
                    <div class="footer">
                        <p>Este es un correo automático, por favor no respondas.</p>
                    </div>
                </div>
            </body>
            </html>
            """

            parte_html = MIMEText(html_content, "html")
            mensaje.attach(parte_html)

            # Envío
            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.send_message(mensaje)

            print(f"✅ Email de restablecimiento enviado a {destinatario_email}")
            return True

        except Exception as e:
            print(f"❌ Error al enviar email de restablecimiento: {str(e)}")
            return False

    async def send_reschedule_email(
        self,
        destinatario_email: str,
        nombre_visitante: str,
        apellido_paterno: str,
        apellido_materno: str,
        nombre_usuario: str,
        fecha_anterior: date,
        hora_anterior: time,
        fecha_nueva: date,
        hora_nueva: time,
        area: str,
        placas: str = None
    ):
        """
        Envía un correo de confirmación cuando se reagenda una cita.
        """
        try:
            mensaje = MIMEMultipart("alternative")
            mensaje["Subject"] = "🔄 Cambio de Fecha/Hora de Cita - Sistema de Visitas"
            mensaje["From"] = self.user
            mensaje["To"] = destinatario_email

            medio_ingreso = f"En vehículo (Placas: {placas})" if placas else "A pie"
            
            # Fechas anteriores
            fecha_anterior_formateada = fecha_anterior.strftime("%d/%m/%Y")
            hora_anterior_formateada = hora_anterior.strftime("%H:%M")
            
            # Fechas nuevas
            fecha_nueva_formateada = fecha_nueva.strftime("%d/%m/%Y")
            hora_nueva_formateada = hora_nueva.strftime("%H:%M")

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
                        background-color: #f59e0b;
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
                        background-color: #fff7ed;
                        border-left: 4px solid #f59e0b;
                        padding: 15px;
                        margin: 20px 0;
                    }}
                    .old-info {{
                        background-color: #fee2e2;
                        border-left: 4px solid #ef4444;
                        padding: 15px;
                        margin: 10px 0;
                        text-decoration: line-through;
                        opacity: 0.7;
                    }}
                    .new-info {{
                        background-color: #d1fae5;
                        border-left: 4px solid #10b981;
                        padding: 15px;
                        margin: 10px 0;
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
                    .contact-box {{
                        background-color: #f0f7ff;
                        border: 2px solid #1e3a8a;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 5px;
                        text-align: center;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔄 Cita Reagendada</h1>
                    </div>
                    <div class="content">
                        <p>Estimado/a <strong>{nombre_visitante} {apellido_paterno} {apellido_materno}</strong>,</p>
                        
                        <p>Le informamos que su cita ha sido <strong>reagendada exitosamente</strong>.</p>
                        
                        <h3 style="color: #ef4444;">❌ Fecha y Hora Anterior:</h3>
                        <div class="old-info">
                            <div class="info-item">
                                <span class="label">📅 Fecha:</span> {fecha_anterior_formateada}
                            </div>
                            <div class="info-item">
                                <span class="label">🕐 Hora:</span> {hora_anterior_formateada}
                            </div>
                        </div>

                        <h3 style="color: #10b981;">✅ Nueva Fecha y Hora:</h3>
                        <div class="new-info">
                            <div class="info-item">
                                <span class="label">📅 Fecha:</span> {fecha_nueva_formateada}
                            </div>
                            <div class="info-item">
                                <span class="label">🕐 Hora:</span> {hora_nueva_formateada}
                            </div>
                        </div>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0; color: #1e3a8a;">Detalles de la Cita:</h3>
                            
                            <div class="info-item">
                                <span class="label">👤 Visitará a:</span> {nombre_usuario}
                            </div>
                            
                            <div class="info-item">
                                <span class="label">🏢 Área:</span> {area}
                            </div>
                            
                            <div class="info-item">
                                <span class="label">🚶 Medio de ingreso:</span> {medio_ingreso}
                            </div>
                        </div>
                        
                        <p><strong>⚠️ Importante:</strong></p>
                        <ul>
                            <li>Por favor llegue 10 minutos antes de su cita</li>
                            <li>Traiga una identificación oficial vigente</li>
                            <li>Asegúrese de anotar la nueva fecha y hora</li>
                        </ul>

                        <div class="contact-box">
                            <p><strong>📞 ¿Tiene alguna duda?</strong></p>
                            <p>Contáctenos al: <strong style="color: #1e3a8a; font-size: 18px;">951 458 1314</strong></p>
                        </div>
                        
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

            print(f"✅ Email de reagendado enviado correctamente a {destinatario_email}")
            return True

        except Exception as e:
            print(f"❌ Error al enviar email de reagendado: {str(e)}")
            return False

