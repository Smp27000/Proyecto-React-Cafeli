import uuid
import logging
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.chatbot import Conversacion, Mensaje
from app.models.usuario import Usuario
from app.schemas.chatbot import (
    MensajeCreate,
    MensajeResponse,
    ChatbotResponse,
    ConversacionResponse,
    ConversacionListResponse
)
from app.auth import get_current_active_user, require_admin_or_empleado, require_any_authenticated
from app.config import settings

logger = logging.getLogger("cafeli_chatbot")
router = APIRouter(prefix="/chatbot", tags=["Chatbot con Inteligencia Artificial"])


SYSTEM_PROMPT = """Eres Cafélito, el amable asistente virtual de CafeLi, una tienda en línea especializada en café de especialidad colombiano. Tu misión es ayudar a los usuarios con:
1. Información sobre nuestros productos (cafés en grano, molidos, accesorios).
2. Información sobre servicios como catas, talleres y mantenimiento de cafeteras.
3. Proceso de compra, envíos, métodos de pago y tiempos de entrega.
4. Orientación sobre PQR: cómo registrar una petición, queja, reclamo o sugerencia.
5. Preguntas frecuentes sobre horarios, ubicación, devoluciones.

Reglas:
- Sé cordial, breve y preciso. Usa emojis cuando sea apropiado.
- Si no sabes la respuesta, sugiere que el usuario registre una PQR o contacte con un asesor.
- Para PQR, explica que se pueden registrar desde la sección "Mi Cuenta" -> "Mis PQR".
- Recuerda: nuestros envíos son 2-5 días hábiles, con Interrapidísimo o Servientrega.
- Métodos de pago: contraentrega, tarjeta crédito/débito, transferencia Bancolombia o Nequi.
- Nuestros cafés son de origen: Huila, Nariño, Antioquia, Santander, Caldas, Quindío.
"""

FALLBACK_RESPONSES = {
    "saludo": (
        "¡Hola! 👋 Soy Cafélito ☕, tu asistente virtual en CafeLi.\n\n"
        "Estoy aquí para ayudarte con respuestas inmediatas sobre:\n"
        "☕ Variedades y tipos de café\n"
        "💰 Precios y métodos de pago\n"
        "🚚 Envíos y tiempos de entrega\n"
        "✨ Servicios de Barismo y Catas\n"
        "📝 PQR (Peticiones, Quejas y Reclamos)\n"
        "📍 Horarios y ubicación\n\n"
        "¿Sobre qué tema te gustaría consultar?"
    ),
    "productos": (
        "☕ **Nuestros Cafés de Especialidad 100% Colombianos:**\n\n"
        "• **Café Geisha (Huila):** Notas florales a jazmín y bergamota con acidez brillante.\n"
        "• **Bourbon Rosado (Nariño):** Sabor dulce a durazno, miel y frutos rojos.\n"
        "• **Castillo & Caturra (Antioquia):** Notas a chocolate oscuro, caramelo y nueces.\n"
        "• **Maragogipe (Santander):** Granos gigantes con notas a naranja y panela.\n"
        "• **Orgánico de Altura (Sierra Nevada):** Cuerpo cremoso, herbal y achocolatado.\n\n"
        "Disponibles en grano entero o molido según tu cafetera (Prensa francesa, Dripper, Espresso o Italiana)."
    ),
    "precios": (
        "💰 **Lista de Precios Principales:**\n\n"
        "• **Café de Especialidad (250g / 500g):** Desde $24.000 COP hasta $65.000 COP (según variedad y micro-lote).\n"
        "• **Prensa Francesa de Vidrio:** $48.000 COP\n"
        "• **Molino Manual Cerámico:** $62.000 COP\n"
        "• **Taller de Barismo / Cata guiada:** $85.000 COP por persona.\n\n"
        "Puedes explorar el catálogo completo añadiendo tus favoritos al carrito 🛒."
    ),
    "geisha": (
        "🌸 **Café Geisha Especial:**\n"
        "Cultivado a más de 1.850 msnm en San Agustín, Huila. Posee un perfil floral exótico, notas a jazmín, lima dulce y té de limón. Puntaje SCA: 88.5 puntos. Precio: $65.000 COP (250g)."
    ),
    "servicios": (
        "✨ **Servicios y Experiencias de Barismo:**\n\n"
        "1. **Cata Sensorial de Café:** Degustación guiada de 5 varietales (1.5 horas).\n"
        "2. **Taller de Arte Latte & Métodos Filtrados:** Aprende Chemex, V60 y AeroPress (3 horas).\n"
        "3. **Coffee Break Corporativo:** Estación móvil de café de especialidad para eventos.\n"
        "4. **Mantenimiento & Calibración de Molinos/Máquinas.**\n\n"
        "Para reservas, puedes escribirnos directamente por el botón de WhatsApp 📲."
    ),
    "envios": (
        "🚚 **Políticas de Envío:**\n\n"
        "• **Cobertura:** Envíos a toda Colombia vía Interrapidísimo, Servientrega y Coordinadora.\n"
        "• **Tiempos de entrega:** De 2 a 4 días hábiles (ciudades principales) y 3 a 6 días (resto del país).\n"
        "• **Tarifa:** $12.000 COP para envíos estándar.\n"
        "• **¡Envío GRATIS!** Por compras superiores a $150.000 COP."
    ),
    "pagos": (
        "💳 **Métodos de Pago Disponibles:**\n\n"
        "• **Pago Contraentrega:** Paga en efectivo o datáfono al recibir tu pedido en casa.\n"
        "• **Transferencias Directas:** Bancolombia, Nequi y Daviplata.\n"
        "• **Tarjetas:** Crédito y Débito (Visa, Mastercard, American Express).\n"
        "• **PSE:** Pago seguro en línea desde cualquier banco colombiano."
    ),
    "pqr": (
        "📝 **Gestión de PQR (Peticiones, Quejas, Reclamos y Sugerencias):**\n\n"
        "Para radicar una PQR formal y hacerle seguimiento en tiempo real:\n"
        "1. Inicia sesión en tu cuenta de CafeLi.\n"
        "2. Dirígete a la pestaña **'Mis PQR'** en tu panel de cliente.\n"
        "3. Haz clic en **'+ Nueva PQR'**, selecciona el motivo y redacta tu solicitud.\n\n"
        "Nuestro equipo de soporte responderá tu caso en un plazo máximo de 24 a 48 horas hábiles."
    ),
    "horarios_ubicacion": (
        "📍 **Ubicación y Horarios de Atención:**\n\n"
        "• **Tienda & Laboratorio:** Carrera 43 #12-34, El Poblado, Medellín, Colombia.\n"
        "• **Lunes a Viernes:** 7:00 AM — 9:00 PM\n"
        "• **Sábados:** 8:00 AM — 10:00 PM\n"
        "• **Domingos y Festivos:** 8:30 AM — 8:00 PM\n"
        "• **Línea de soporte y WhatsApp:** +57 300 123 4567"
    ),
    "registro_login": (
        "👤 **Cuentas y Registro:**\n\n"
        "Puedes registrarte gratis haciendo clic en **'Iniciar Sesión'** → **'¿No tienes cuenta? Regístrate'**.\n"
        "Con tu cuenta podrás guardar direcciones, ver historial de pedidos, acumular beneficios y radicar PQRs."
    ),
    "descuentos": (
        "🎁 **Promociones y Descuentos:**\n\n"
        "• 10% de descuento en tu primera compra registrándote en nuestra web.\n"
        "• Envíos gratis por compras superiores a $150.000 COP.\n"
        "• Descuentos especiales por suscripción mensual de café en grano."
    ),
    "default": (
        "He recibido tu mensaje. 😊\n\n"
        "Puedo darte respuesta inmediata sobre:\n"
        "• *'¿Qué cafés tienen?'*\n"
        "• *'Precios de productos'*\n"
        "• *'Tiempos y costos de envío'*\n"
        "• *'Métodos de pago'*\n"
        "• *'Servicios y talleres'*\n"
        "• *'Horarios y dirección'*\n"
        "• *'Cómo hacer una PQR'*\n\n"
        "Si necesitas atención personalizada de un barista, contáctanos mediante el botón verde de WhatsApp 📲."
    )
}


def _buscar_respuesta_reglas(mensaje: str) -> Optional[str]:
    m = mensaje.lower().strip()

    # Saludos
    if any(p in m for p in ["hola", "buenos días", "buenas tardes", "buenas noches", "buenas", "qué tal", "holi", "saludos"]):
        return FALLBACK_RESPONSES["saludo"]

    # Café Geisha específico
    if any(p in m for p in ["geisha", "gesha"]):
        return FALLBACK_RESPONSES["geisha"]

    # Precios / Costos
    if any(p in m for p in ["precio", "precios", "cuanto vale", "cuánto vale", "cuanto cuesta", "cuánto cuesta", "costo", "valor", "tarifa"]):
        return FALLBACK_RESPONSES["precios"]

    # Productos / Café / Variedades / Tienda
    if any(p in m for p in ["producto", "productos", "café", "cafes", "cafe", "grano", "molido", "tueste", "variedad", "variedades", "catalogo", "catálogo", "comprar", "tipo de cafe", "tipos de cafe"]):
        return FALLBACK_RESPONSES["productos"]

    # Servicios / Barismo / Catas / Talleres
    if any(p in m for p in ["servicio", "servicios", "barismo", "cata", "catas", "taller", "talleres", "curso", "cursos", "evento", "mantenimiento"]):
        return FALLBACK_RESPONSES["servicios"]

    # Envíos / Domicilio / Tiempos
    if any(p in m for p in ["envío", "envio", "envíos", "envios", "entrega", "domicilio", "demora", "tarda", "tiempo", "cobertura", "shipping", "flete"]):
        return FALLBACK_RESPONSES["envios"]

    # Métodos de Pago
    if any(p in m for p in ["pago", "pagar", "metodo de pago", "método de pago", "tarjeta", "transferencia", "nequi", "bancolombia", "contraentrega", "daviplata", "pse"]):
        return FALLBACK_RESPONSES["pagos"]

    # PQR / Quejas / Reclamos / Peticiones
    if any(p in m for p in ["pqr", "queja", "quejas", "reclamo", "reclamos", "petición", "peticion", "sugerencia", "sugerencias", "problema", "reclamar", "garantia", "garantía"]):
        return FALLBACK_RESPONSES["pqr"]

    # Horarios, Dirección, Ubicación, Contacto
    if any(p in m for p in ["horario", "horarios", "ubicacion", "ubicación", "donde estan", "dónde están", "direccion", "dirección", "abierto", "sede", "contacto", "teléfono", "telefono", "whatsapp", "correo", "email"]):
        return FALLBACK_RESPONSES["horarios_ubicacion"]

    # Registro / Cuenta / Login
    if any(p in m for p in ["registro", "registrar", "cuenta", "login", "iniciar sesion", "iniciar sesión", "clave", "password", "contraseña"]):
        return FALLBACK_RESPONSES["registro_login"]

    # Promociones / Descuentos
    if any(p in m for p in ["promo", "promocion", "promoción", "descuento", "descuentos", "cupon", "cupón", "oferta", "ofertas"]):
        return FALLBACK_RESPONSES["descuentos"]

    # Despedida / Agradecimiento
    if any(p in m for p in ["gracias", "muchas gracias", "chao", "adiós", "adios", "hasta luego"]):
        return "¡Con todo el gusto! ☕ Que tengas un excelente día y disfrutes del mejor café. Recuerda que siempre estamos para servirte."

    return FALLBACK_RESPONSES["default"]


async def _obtener_respuesta_openai(mensaje_usuario: str, historial: list) -> str:
    if not settings.OPENAI_API_KEY:
        return None

    try:
        import httpx

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in historial[-10:]:
            role = "assistant" if msg["remitente"] == "Bot" else "user"
            messages.append({"role": role, "content": msg["contenido"]})
        messages.append({"role": "user", "content": mensaje_usuario})

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": settings.OPENAI_MODEL or "gpt-3.5-turbo",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 500,
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
            logger.warning(f"OpenAI error: {resp.status_code} {resp.text}")
            return None
    except Exception as e:
        logger.error(f"Error llamando OpenAI: {e}")
        return None


def _construir_respuesta_chatbot(session_id, mensajes_db):
    msgs_resp = [MensajeResponse.model_validate(m) for m in mensajes_db]
    return ChatbotResponse(
        success=True,
        session_id=session_id,
        respuesta=msgs_resp[-1].contenido if msgs_resp else "",
        mensajes=msgs_resp
    )


@router.post("/mensaje", response_model=ChatbotResponse, summary="Enviar mensaje al chatbot y recibir respuesta")
async def enviar_mensaje(
    body: MensajeCreate,
    db: Session = Depends(get_db),
    current_user: Optional[Usuario] = Depends(lambda: None)
):
    try:
        current_user = Depends(get_current_active_user)  # try optional auth
    except Exception:
        current_user = None

    session_id = body.session_id or f"sess-{uuid.uuid4().hex[:16]}"

    conv = db.query(Conversacion).filter(Conversacion.session_id == session_id).first()
    if not conv:
        conv = Conversacion(
            session_id=session_id,
            usuario_id=current_user.id if current_user and hasattr(current_user, "id") else None,
            titulo=body.contenido[:60] or "Nueva conversación",
            origen="Web",
            finalizada=False
        )
        db.add(conv)
        db.flush()

    # Guardar mensaje del usuario
    msg_usuario = Mensaje(
        conversacion_id=conv.id,
        remitente="Usuario",
        contenido=body.contenido.strip()
    )
    db.add(msg_usuario)
    db.flush()

    # Obtener historial
    historial = db.query(Mensaje).filter(
        Mensaje.conversacion_id == conv.id
    ).order_by(Mensaje.fecha_envio.asc()).all()
    historial_dicts = [{"remitente": m.remitente, "contenido": m.contenido} for m in historial]

    # Respuesta por reglas primero
    respuesta = _buscar_respuesta_reglas(body.contenido)

    # Si no hay respuesta por reglas, intentar IA
    if not respuesta:
        respuesta_ia = await _obtener_respuesta_openai(body.contenido, historial_dicts)
        respuesta = respuesta_ia or (
            "Entiendo tu consulta. Si requieres ayuda más específica, puedes "
            "registrar una PQR desde tu cuenta o contactarnos por el botón de WhatsApp. ☕✨"
        )

    msg_bot = Mensaje(
        conversacion_id=conv.id,
        remitente="Bot",
        contenido=respuesta
    )
    db.add(msg_bot)
    conv.fecha_ultima_interaccion = datetime.now()
    db.commit()

    todos = db.query(Mensaje).filter(Mensaje.conversacion_id == conv.id).order_by(Mensaje.fecha_envio.asc()).all()
    return _construir_respuesta_chatbot(session_id, todos)


@router.get("/conversacion/{session_id}", response_model=ChatbotResponse, summary="Recuperar historial de conversación")
def get_conversacion(
    session_id: str,
    db: Session = Depends(get_db)
):
    conv = db.query(Conversacion).filter(Conversacion.session_id == session_id).first()
    if not conv:
        return ChatbotResponse(
            success=True,
            session_id=session_id,
            respuesta=FALLBACK_RESPONSES["default"],
            mensajes=[]
        )
    msgs = db.query(Mensaje).filter(Mensaje.conversacion_id == conv.id).order_by(Mensaje.fecha_envio.asc()).all()
    return _construir_respuesta_chatbot(session_id, msgs)


@router.get("/conversaciones", response_model=ConversacionListResponse, summary="Listar conversaciones (Admin/Empleado)")
def listar_conversaciones(
    finalizada: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=300),
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    q = db.query(Conversacion)
    if finalizada is not None:
        q = q.filter(Conversacion.finalizada == finalizada)
    total = q.count()
    convs = q.order_by(Conversacion.fecha_ultima_interaccion.desc()).offset(skip).limit(limit).all()
    respuestas = []
    for c in convs:
        msgs = [MensajeResponse.model_validate(m) for m in c.mensajes[:20]]
        respuestas.append(ConversacionResponse(
            id=c.id,
            usuario_id=c.usuario_id,
            session_id=c.session_id,
            titulo=c.titulo,
            origen=c.origen,
            fecha_inicio=c.fecha_inicio,
            fecha_ultima_interaccion=c.fecha_ultima_interaccion,
            finalizada=c.finalizada,
            mensajes=msgs
        ))
    return ConversacionListResponse(success=True, total=total, conversaciones=respuestas)
