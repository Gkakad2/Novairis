import json
from pathlib import Path

BASELINE_DIR = Path("baseline/data")
BASELINE_DIR.mkdir(parents=True, exist_ok=True)


def get_file(hostname):
    return BASELINE_DIR / f"{hostname}.json"


def baseline_exists(hostname):
    return get_file(hostname).exists()


def load_baseline(hostname):

    with open(get_file(hostname), "r") as f:
        return json.load(f)


def save_baseline(hostname, telemetry):

    with open(get_file(hostname), "w") as f:
        json.dump(telemetry, f, indent=4)
