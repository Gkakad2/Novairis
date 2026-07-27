import json
from collector.discovery import Discovery

client = Discovery(
    host="192.168.175.197",
    user="esec"
)

results = client.collect()

with open("baseline/client_baseline.json", "w") as f:
    json.dump(results, f, indent=4)

print("Baseline created.")
