'use strict';

const express   = require('express');
const crypto    = require('crypto');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

// ── Validación de variables críticas ─────────────────
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY    = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME) throw new Error('[Fylox] FATAL: CLOUDINARY_CLOUD_NAME no definida');
if (!CLOUDINARY_API_KEY)    throw new Error('[Fylox] FATAL: CLOUDINARY_API_KEY no definida');
if (!CLOUDINARY_API_SECRET) throw new Error('[Fylox] FATAL: CLOUDINARY_API_SECRET no definida');

const uploadLimiter = rateLimit({
  windowMs:        60 * 1000,      // 1 minuto
  max:             10,             // 10 uploads por minuto por IP
  message:         { error: 'Demasiados uploads. Esperá un momento.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── POST /api/uploads/sign ────────────────────────────
// El frontend pide una firma temporal para subir a Cloudinary.
// Las credenciales NUNCA salen del backend.
router.post('/sign',
  authenticate,
  uploadLimiter,
  async (req, res) => {
    try {
      const folder    = 'oracle';
      const timestamp = Math.round(Date.now() / 1000);

      // Parámetros que se van a firmar — deben coincidir exactamente
      // con los que el frontend manda a Cloudinary
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

      // Firma HMAC-SHA256 con el API Secret
      const signature = crypto
        .createHash('sha256')
        .update(paramsToSign + CLOUDINARY_API_SECRET)
        .digest('hex');

      res.json({
        signature,
        timestamp,
        cloudName: CLOUDINARY_CLOUD_NAME,
        apiKey:    CLOUDINARY_API_KEY,
        folder,
      });

    } catch (err) {
      console.error('[Fylox Uploads] Error generando firma:', err.message);
      res.status(500).json({ error: 'Error generando firma de upload' });
    }
  }
);

module.exports = router;
