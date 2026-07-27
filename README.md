# NOVAIRIS

<div align="center">

# Next-Generation Open Virtual AI Response & Incident Security Platform

*A lightweight Endpoint Detection & Response (EDR) platform for real-time endpoint monitoring, behavioral threat detection, incident response, asset management, and SOC operations.*

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.x-black?logo=flask)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite)
![MITRE](https://img.shields.io/badge/MITRE-ATT%26CK-red)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

# Overview

NOVAIRIS is a modern Endpoint Detection and Response (EDR) platform developed to demonstrate the core capabilities of enterprise-grade security monitoring solutions.

The platform continuously monitors endpoints, collects telemetry, detects behavioral anomalies, generates incidents, maps threats to the MITRE ATT&CK framework, and visualizes security information through an interactive Security Operations Center (SOC) dashboard.

Designed with modularity and scalability in mind, NOVAIRIS provides a lightweight yet extensible architecture suitable for cybersecurity research, academic projects, and SOC demonstrations.

---

# Features

## Endpoint Monitoring

- Real-time endpoint heartbeat
- Online / Offline host monitoring
- Host inventory
- Operating System identification
- Kernel version tracking
- Last seen monitoring
- Endpoint telemetry collection

---

## Asset Management

- Centralized asset inventory
- Live host monitoring
- Resource utilization
- Host search
- Dynamic filtering
- Host deletion
- Detailed asset information

---

## Incident Detection

- Behavioral detection engine
- Rule-based detection
- Automatic incident generation
- Severity classification
- Incident lifecycle management
- Live incident feed

---

## Threat Intelligence

- Threat score calculation
- MITRE ATT&CK mapping
- Threat severity visualization
- Top MITRE techniques
- Security posture overview

---

## Process Monitoring

Collects

- Running processes
- CPU usage
- Memory usage
- Process owner
- Process command
- Process ID

Automatically detects

- Newly started processes
- Behavioral drift
- Suspicious processes
- Unknown executables

---

## Dashboard

Interactive SOC Dashboard including

- Security Overview
- Live Threat Feed
- Incident Summary
- Threat Intelligence
- Host Resource Monitoring
- Asset Inventory
- MITRE ATT&CK Statistics
- Analytics
- Settings

---

# Architecture

```text
                    +----------------------+
                    |    Client Agent      |
                    | Endpoint Collector   |
                    +----------+-----------+
                               |
                     Heartbeat / Telemetry
                               |
                               ▼
                  +------------------------+
                  |      Flask REST API    |
                  +-----------+------------+
                              |
          +-------------------+-------------------+
          |                                       |
          ▼                                       ▼
   Detection Engine                       SQLite Database
          |                                       |
          ▼                                       ▼
 Incident Generation                    Asset & Process Data
          |
          ▼
 Threat Intelligence Engine
          |
          ▼
   React SOC Dashboard
```

---

# Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Lucide React
- JavaScript

---

## Backend

- Python
- Flask
- SQLAlchemy
- SQLite
- Flask-CORS

---

## Security Components

- Endpoint Detection & Response
- Behavioral Detection
- MITRE ATT&CK Mapping
- Incident Correlation
- Threat Intelligence
- Rule-Based Detection

---

# Project Structure

```text
Novairis
│
├── api/
│   ├── server.py
│   ├── dashboard.py
│
├── dashboard/
│   └── frontend/
│
├── detector/
│
├── collectors/
│
├── services/
│
├── database/
│
├── rules/
│
├── docs/
│
├── screenshots/
│
├── requirements.txt
│
└── osvf.db
```

---

# Dashboard Modules

- Dashboard
- Assets
- Incidents
- Threat Intelligence
- Analytics
- Settings

---

# Detection Workflow

```text
Endpoint Agent
      │
      ▼
Collect Telemetry
      │
      ▼
Store in Database
      │
      ▼
Detection Engine
      │
      ▼
Generate Incident
      │
      ▼
MITRE ATT&CK Mapping
      │
      ▼
SOC Dashboard Visualization
```

---

# REST API

## Dashboard APIs

```
GET /dashboard/summary

GET /dashboard/resources

GET /dashboard/threat-feed

GET /dashboard/threat-intelligence

GET /dashboard/top-mitre
```

---

## Asset APIs

```
GET /assets

GET /assets/summary

GET /assets/hosts

DELETE /hosts/<hostname>
```

---

## Incident APIs

```
GET /incidents

GET /dashboard/incidents

GET /incidents/<id>
```

---

## Process APIs

```
GET /processes

GET /timeline/<hostname>

GET /hunt/process/<name>

GET /hunt/command/<keyword>
```

---

## Endpoint APIs

```
POST /heartbeat
```

---

# Screenshots

## Dashboard

> Add Dashboard Screenshot Here

---

## Assets

> Add Assets Screenshot Here

---

## Incidents

> Add Incidents Screenshot Here

---

## Threat Intelligence

> Add Threat Intelligence Screenshot Here

---

## Settings

> Add Settings Screenshot Here

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

Backend runs on

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

Frontend runs on

```
http://localhost:5173
```

---

# Current Capabilities

- Endpoint Monitoring
- Asset Inventory
- Process Monitoring
- Incident Detection
- Behavioral Threat Detection
- MITRE ATT&CK Mapping
- Threat Intelligence
- Interactive SOC Dashboard
- REST APIs
- Auto Refresh
- Search & Filtering
- Host Management

---

# Future Enhancements

- Windows Endpoint Agent
- Linux Background Service
- IOC Feed Integration
- YARA Rule Support
- Sigma Rule Support
- Malware Hash Detection
- CVE Intelligence
- JWT Authentication
- Role-Based Access Control
- Email Notifications
- Docker Deployment
- Kubernetes Deployment
- PostgreSQL Support
- Elasticsearch Integration
- Wazuh Integration
- Sysmon Integration
- AI-Assisted Threat Hunting

---

# Learning Outcomes

This project demonstrates practical implementation of

- Endpoint Detection & Response (EDR)
- Security Operations Center (SOC)
- Behavioral Threat Detection
- Incident Response
- Threat Intelligence
- MITRE ATT&CK Framework
- REST API Development
- React Frontend Development
- Flask Backend Development
- SQLAlchemy ORM
- Python Security Automation

---

# Inspiration

NOVAIRIS is inspired by modern enterprise Endpoint Detection and Response (EDR) and Security Operations Center (SOC) platforms including:

- Microsoft Defender for Endpoint
- CrowdStrike Falcon
- SentinelOne
- Wazuh
- Velociraptor
- Elastic Security
- Splunk Enterprise Security
- LimaCharlie

This project is developed for educational and research purposes and is **not affiliated with or endorsed by any of the above products or organizations**.

---

# Author

**Gayatri Kakade**

Project Engineer | Cybersecurity | Endpoint Detection & Response | Python | React | Flask | Linux

GitHub: https://github.com/Gkakad2

---

# License

This project is licensed under the MIT License.

---

## ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub to support its development.
