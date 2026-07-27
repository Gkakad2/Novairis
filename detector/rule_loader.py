import yaml
from pathlib import Path

RULE_DIR = Path("rules")


def load_rules():

    rules = []

    for file in RULE_DIR.glob("*.yaml"):

        with open(file, "r") as f:

            data = yaml.safe_load(f)

            if not data:
                continue

            # File contains a list of rules
            if isinstance(data, list):
                rules.extend(data)

            # File contains {"rules": [...]}
            elif isinstance(data, dict):
                rules.extend(data.get("rules", []))

    return rules
