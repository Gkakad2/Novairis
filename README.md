<div align="center">

# NOVAIRIS

### Next-Generation Open Virtual AI Response & Incident Security Platform

Real-time Endpoint Detection & Response (EDR) platform for behavioral threat detection, endpoint monitoring, incident response, asset management, and Security Operations Center (SOC) visualization.

---

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-Backend-black?logo=flask)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite)
![MITRE ATT&CK](https://img.shields.io/badge/MITRE-ATT%26CK-red)
![License](https://img.shields.io/badge/License-MIT-success)

</div>

---

# Dashboard Preview

<p align="center">

<img src="docs/screenshots/dashboard.png" width="95%">

</p>

---

# Overview

NOVAIRIS is a lightweight Endpoint Detection and Response (EDR) platform developed to demonstrate modern Security Operations Center (SOC) capabilities.

The platform continuously collects endpoint telemetry, detects behavioral anomalies, generates incidents, correlates findings with the MITRE ATT&CK framework, and provides analysts with an interactive web-based dashboard for monitoring and response.

Unlike traditional log viewers, NOVAIRIS focuses on behavioral monitoring, endpoint visibility, incident correlation, and threat intelligence through an intuitive security dashboard.

---

# Key Features

| Module | Description |
|---------|-------------|
| Endpoint Monitoring | Real-time endpoint heartbeat, host availability and telemetry |
| Asset Management | Centralized inventory, live endpoint status, search and filtering |
| Process Monitoring | Running processes, CPU, memory, ownership and command tracking |
| Behavioral Detection | Rule-based anomaly detection engine |
| Incident Response | Automatic incident generation with severity classification |
| Threat Intelligence | MITRE ATT&CK mapping and threat scoring |
| Analytics | Security statistics and resource utilization |
| SOC Dashboard | Interactive visualization of security posture |

---

# Screenshots

## Dashboard

<p align="center">
<img src="docs/screenshots/dashboard.png" width="90%">
</p>

---

## Assets

<p align="center">

<img src="docs/screenshots/assets.png" width="48%">

<img src="docs/screenshots/asset_details.png" width="48%">

</p>

---

## Incidents

<p align="center">

<img src="docs/screenshots/incidents.png" width="48%">

<img src="docs/screenshots/threat_feed.png" width="48%">

</p>

---

## Threat Intelligence

<p align="center">

<img src="docs/screenshots/threat_intelligence.png" width="48%">

<img src="docs/screenshots/top_mitre.png" width="48%">

</p>

---

## Settings

<p align="center">

<img src="docs/screenshots/settings.png" width="90%">

</p>

---

# Architecture

<p align="center">

<img src="docs/screenshots/architecture.png" width="90%">

</p>

---

# Detection Workflow

```text
Client Endpoint
      │
      ▼
Heartbeat + Telemetry
      │
      ▼
Flask REST API
      │
      ▼
SQLite Database
      │
      ▼
Detection Engine
      │
      ▼
Incident Generation
      │
      ▼
Threat Intelligence
      │
      ▼
React SOC Dashboard
```

---

# Technology Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React, Vite, Tailwind CSS, Lucide React |
| Backend | Python, Flask |
| Database | SQLite, SQLAlchemy |
| Security | MITRE ATT&CK, Behavioral Detection Engine |
| Communication | REST APIs |
| Endpoint | Python Agent |

---

# Project Structure

```text
Novairis
│
├── api/
├── collectors/
├── dashboard/
│   └── frontend/
├── database/
├── detector/
├── docs/
│   └── screenshots/
├── rules/
├── services/
├── requirements.txt
└── osvf.db
```

---

# REST APIs

## Dashboard

```
GET /dashboard/summary
GET /dashboard/resources
GET /dashboard/threat-feed
GET /dashboard/threat-intelligence
GET /dashboard/top-mitre
```

---

## Assets

```
GET /assets
GET /assets/summary
GET /assets/hosts
DELETE /hosts/<hostname>
```

---

## Incidents

```
GET /incidents
GET /dashboard/incidents
GET /incidents/<id>
```

---

## Processes

```
GET /processes
GET /timeline/<hostname>
GET /hunt/process/<process>
GET /hunt/command/<keyword>
```

---

## Endpoint

```
POST /heartbeat
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Gkakad2/Novairis.git

cd Novairis
```

---

## Backend

```bash
python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

python api/server.py
```

Runs on

```
http://localhost:5000
```

---

## Frontend

```bash
cd dashboard/frontend

npm install

npm run dev
```

Runs on

```
http://localhost:5173
```

---

# Current Capabilities

- Endpoint Monitoring
- Host Inventory
- Asset Management
- Behavioral Detection
- Process Monitoring
- Incident Detection
- Threat Intelligence
- MITRE ATT&CK Mapping
- Interactive SOC Dashboard
- Auto Refresh
- REST APIs
- Host Search & Filtering

---

# Roadmap

- [x] Endpoint Monitoring
- [x] Asset Inventory
- [x] Process Monitoring
- [x] Incident Detection
- [x] Threat Intelligence
- [x] MITRE ATT&CK Mapping
- [x] Interactive Dashboard
- [ ] Windows Endpoint Agent
- [ ] YARA Rule Integration
- [ ] Sigma Rule Support
- [ ] IOC Feed Integration
- [ ] CVE Intelligence
- [ ] Email Notifications
- [ ] PostgreSQL Support
- [ ] Elasticsearch Integration
- [ ] Docker Deployment
- [ ] Kubernetes Deployment
- [ ] AI Assisted Threat Hunting

---

# Inspiration

NOVAIRIS draws inspiration from modern Endpoint Detection and Response (EDR) and Security Operations Center (SOC) platforms including:

- Microsoft Defender for Endpoint
- CrowdStrike Falcon
- SentinelOne
- Wazuh
- Velociraptor
- Elastic Security
- Splunk Enterprise Security
- LimaCharlie

This project is developed solely for educational and research purposes and is not affiliated with any of the above products.

---

# Author

## Gayatri Kakade

Project Engineer • Cybersecurity • Endpoint Detection & Response • Python • React • Flask • Linux

GitHub

https://github.com/Gkakad2

---

# License

This project is licensed under the MIT License.

---

<div align="center">

If you found this project useful, consider giving it a ⭐ on GitHub.

</div>
