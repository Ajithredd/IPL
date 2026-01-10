import requests

url = "https://www.iplt20.com/teams/mumbai-indians/squad"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

try:
    response = requests.get(url, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    if "Rohit Sharma" in response.text:
        print("Found Rohit Sharma in response")
    else:
        print("Content might be dynamic or blocked")
except Exception as e:
    print(f"Error: {e}")
