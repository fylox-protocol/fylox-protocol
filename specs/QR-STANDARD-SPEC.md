# Fylox QR Standard Specification

Last updated: 2026

## Overview

The Fylox QR Standard defines the format for encoding payment requests into QR codes.  
It is designed to be simple, interoperable, and secure.  
This standard allows wallets and merchant apps to exchange payment requests reliably using QR codes.

## QR Data Format

A Fylox Payment QR encodes the following parameters as a URI:

fylox://pay?merchant=<merchant_id>&amount=<amount>&currency=<currency>&reference=<reference>&description=<description>&timestamp=<timestamp>&callback_url=<callback_url>

### Parameters

| Parameter      | Required | Description |
|----------------|----------|-------------|
| merchant       | Yes      | Unique identifier for the merchant or recipient |
| amount         | Yes      | Payment amount in Pi (or supported token) |
| currency       | Yes      | Token code (initially "Pi") |
| reference      | No       | Optional reference ID for tracking |
| description    | No       | Optional description of the payment |
| timestamp      | Yes      | ISO 8601 timestamp of the request |
| callback_url   | No       | Optional HTTPS URL for payment confirmation callback |

## Encoding Rules

1. All parameters must be URL-encoded.  
2. Optional parameters (description, reference, callback_url) can be omitted if not needed.  
3. The order of parameters must follow the table above.  
4. QR codes must be high-resolution for reliable scanning.

## Example QR URI

fylox://pay?merchant=fylox_merchant_001&amount=25.50&currency=Pi&reference=INV-20260311-001&description=Purchase%20of%20digital%20assets&timestamp=2026-03-11T00:00:00Z&callback_url=https%3A%2F%2Fmerchant.example.com%2Ffylox_callback

## Validation Rules

- merchant must be registered in the Fylox ecosystem.  
- amount must be a positive number.  
- currency must be a supported token.  
- timestamp must follow ISO 8601 format.  
- If callback_url is present, it must use HTTPS.

## Security Considerations

- All QR data should be signed or validated by the wallet to prevent tampering.  
- Merchants should verify reference and amount before confirming the payment.  
- All callbacks should implement authentication and replay protection.

## Extensibility

- Future versions may include multi-chain support.  
- Optional parameters may be added in future versions:
  - metadata for custom merchant data  
  - expiry for payment expiration  
  - fees for transaction fees
