#!/bin/bash
SUPABASE_URL="https://rbohkcfxowpyaymqhize.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJib2hrY2Z4b3dweWF5bXFoaXplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEyNzM0OCwiZXhwIjoyMDk0NzAzMzQ4fQ.gkY873jXWzwajpQuV9AtxSWRPmto6s2b5zCeSxep_qk"

curl -s "${SUPABASE_URL}/rest/v1/borrowings?select=id,due_at,resident:residents!borrowings_resident_id_fkey(name,whatsapp_number),book:books(title)&returned_at=is.null" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}"
