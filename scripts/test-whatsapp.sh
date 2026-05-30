#!/bin/bash
WHATSAPP_TOKEN="EAAdH6YTpEqkBRtfaNJgjyG2LzyXrB2wZBqzZABkEPOj0hBqZCfxFP4NggToPhyaKbtnNK8FUGJyIwBwOQn9ZACxndctIWNZCmIq7MFdEWY11007hr2rDQFUDPH8PPIpAqHkAkyRZAu7d9ZBcqvv8PNBAn72FGNcX2M7Rl1O6B8nXbSyYVXUsLGdckPy5m9T56HFsEjW5ixciGCGBf70KsvycmDIEhpuk4K3o1TEweoexMR7X1a0iVCvZBNCs9Y6CCN6WKfjYBguPRnbyLy36xmbpZADVxIOYm0xkZD"
WHATSAPP_PHONE_ID="1153589527833508"

curl -s -X POST "https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages" \
  -H "Authorization: Bearer ${WHATSAPP_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "919175558996",
    "type": "text",
    "text": {"body": "Test message from Pride Platinum Library reminder system."}
  }'
