import requests
import json
import os
from datetime import datetime

# =========================
# CONFIG — YOUR CENTRAL SYSTEM
# =========================

AURICRUX_FUNCTION_URL = "https://auricrux-central.azurewebsites.net/api/execute"  
# (we will fix endpoint name if needed)

# =========================

def now():
    return datetime.utcnow().isoformat()

def send_command_to_auricrux():
    payload = {
        "timestamp": now(),
        "directive": "EXECUTE_FULL_SYSTEM",
        "priority": "maximum",
        "scope": "ALL_FCA"
    }

    try:
        response = requests.post(AURICRUX_FUNCTION_URL, json=payload)

        print("Status:", response.status_code)
        print("Response:", response.text)

    except Exception as e:
        print("ERROR:", str(e))

def main():
    print("Auricrux Central Execution Triggered")

    send_command_to_auricrux()

    print("Execution Complete")

if __name__ == "__main__":
    main()