# Fylox Payment Request Specification

Last updated: 2026

## Overview

The Fylox Payment Request defines the standardized format for requesting and processing payments within the Fylox Protocol.  
It is designed to be **simple, interoperable, and compatible with QR-based transactions**.

The initial version focuses on **Pi Network transactions**, with future support for multi-chain payments.

---

## Payment Request Format

A Payment Request includes the following fields:

| Field         | Type      | Required | Description |
|---------------|-----------|----------|-------------|
| `merchant_id` | string    | Yes      | Unique identifier for the merchant or recipient |
| `amount`      | decimal   | Yes      | Payment amount in Pi (or other supported token in future) |
| `currency`    | string    | Yes      | Currency code (e.g., "Pi") |
| `description` | string    | No       | Optional description of the payment purpose |
| `reference`   | string    | No       | Optional reference ID for tracking |
| `timestamp`   | string    | Yes      | ISO 8601 timestamp of the request |
| `callback_url`| string    | No       | Optional URL for payment confirmation callback |

---

## Example JSON Payment Request

```json
{
  "merchant_id": "fylox_merchant_001",
  "amount": 25.50,
  "currency": "Pi",
  "description": "Purchase of digital assets",
  "reference": "INV-20260311-001",
  "timestamp": "2026-03-11T00:00:00Z",
  "callback_url": "https://merchant.example.com/fylox_callback"
}

## QR Representation

Payment requests can be encoded in a QR code to enable **simple scanning and payment**.

### QR URI Example
fylox://pay?merchant=fylox_merchant_001&amount=25.50&currency=Pi&reference=INV-20260311-001
Copiar código

### Notes

- `fylox://pay` is the **protocol scheme**.
- All fields are **URL-encoded**.
- Optional fields (`description`, `callback_url`) may be omitted if not needed.

## Validation Rules

- `merchant_id` must be **unique** and registered within the Fylox ecosystem.
- `amount` must be a **positive number**.
- `currency` must be a **supported token** (initially Pi).
- `timestamp` must follow **ISO 8601 format**.
- If `callback_url` is present, it must use **HTTPS**.

## Security Considerations

- All QR data should be **signed or validated** by the payer’s wallet to prevent tampering.
- Merchants should verify `reference` and `amount` before confirming the payment.
- All callbacks should implement proper **authentication and replay protection**.

## Extensibility

- Future versions may support **multi-chain currencies**.
- Additional optional fields may include:
  - `metadata` for custom merchant data
  - `expiry` to set payment expiration time
  - `fees` to include transaction fees for processing
