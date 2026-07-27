# Novairis

Host security monitoring / drift-detection system. Collector agents gather
host telemetry (processes, services, ports, users), a detector engine
compares it against a stored baseline and rule set, drift is written up as
incidents, and a Flask API + React dashboard surface the results.

## Layout

```
api/            Flask app (server.py) - the live HTTP API
  dashboard.py    Legacy FastAPI router, NOT wired into server.py - kept
                   for reference, not part of the running app
collector/      SSH-based host discovery (collector/discovery.py)
detector/       Drift-detection engine, rule loading, incident creation
database/
  db.py           SQLAlchemy engine/session setup
  models.py       ORM models (Host, Incident, Telemetry, Process, ...)
  init_db.py      Schema bootstrap
  repositories/   All data-access functions, one module per domain
                   (assets, dashboard, host, incident, process,
                   process_search, telemetry, timeline)
baseline/       Baseline snapshot storage + management
rules/          YAML drift-detection rule definitions
dashboard/frontend/   React + Vite dashboard (see its own README)
incidents/      Generated incident JSON files (runtime output, gitignored)
logs/           Runtime telemetry logs (gitignored)
cache/          Runtime cache, e.g. active_alerts.json (gitignored)
```

`agent/`, `attacks/`, `configs/`, `core/`, `docs/`, `reports/`, `scripts/`,
`tests/` are scaffolded but currently empty - kept as placeholders for
planned work.

## Setup

**Backend**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python database/init_db.py     # create schema
python api/server.py
```

**Frontend**
```bash
cd dashboard/frontend
npm install
npm run dev
```

## Notes from the last cleanup

- `database/incident_repository.py` was a stale, unused duplicate of
  `database/repositories/incident_repository.py` (the one actually
  imported everywhere) and has been removed. The other repository
  modules (`assets`, `dashboard`, `process`, `process_search`,
  `telemetry`, `timeline`) have been moved into `database/repositories/`
  to finish that refactor consistently; all imports were updated to match.
- `requirements.txt` was missing `Flask-Cors` and `SQLAlchemy`, both of
  which `api/server.py` and the database layer import directly - added,
  pinned to the versions found in the original environment.
- A committed `venv/` (171 MB) and `dashboard/frontend/node_modules/`
  (242 MB) were removed from the tree - both are fully reproducible from
  `requirements.txt` / `package.json` and should never be committed.
  Regenerate them with the setup commands above.
- Stray root-level runtime artifacts (`server.log`, `api.log`,
  `flask.log`, `vite.log`, `novairis-frontend.log`, `nohup.out`,
  `osvf.db` [172 MB SQLite DB], `logs/telemetry/` [612 MB]) were removed
  - these are all generated at runtime, not source. `.gitignore` now
  excludes this class of file going forward.
- `incidents/*.json` (hundreds of generated incident records) and
  `cache/active_alerts.json` were runtime output, not fixtures - removed
  and gitignored; the directories are kept (with `.gitkeep`) since the
  app writes into them at runtime.
- `api/dashboard.py` defines a FastAPI `APIRouter` but the live app
  (`api/server.py`) is Flask and never imports it - it's dead code from
  what looks like an earlier framework choice. Left in place since it
  wasn't asked to be rewritten, but flagged here since it looks
  unintentional; nothing else depends on it.
