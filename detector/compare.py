def compare_set(old_items, new_items, key):

    old = {str(item[key]) for item in old_items if key in item}

    new = {str(item[key]) for item in new_items if key in item}

    return {
        "added": sorted(new - old),
        "removed": sorted(old - new),
        "active": sorted(new)
    }


def compare(current, baseline):

    findings = {}

    findings["processes"] = compare_set(
        baseline.get("processes", []),
        current.get("processes", []),
        "command"
    )

    findings["ports"] = compare_set(
        baseline.get("ports", []),
        current.get("ports", []),
        "port"
    )

    findings["services"] = compare_set(
        baseline.get("services", []),
        current.get("services", []),
        "service"
    )

    findings["users"] = compare_set(
        baseline.get("users", []),
        current.get("users", []),
        "user"
    )

    return findings
