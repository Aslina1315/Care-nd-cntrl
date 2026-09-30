CARE & CTRL

See earlier. Decide smarter.

CARE & CTRL is an AI-powered healthcare decision-support platform that connects patient health data, population-level signals, healthcare facility operations, resource availability, and human-approved actions into one connected workflow.

The platform is designed to help healthcare teams move from fragmented healthcare information toward connected, explainable and actionable decision support.

👥 Team

Team Name

Ctrl+Ai

Team Members

Noorul Aslina M

Karthikeyan M

Institution

Saveetha Engineering College, Chennai, Tamil Nadu, India

📌 Project Title

CARE & CTRL

Tagline

See earlier. Decide smarter.

🚨 Problem Statement

Healthcare information is often fragmented across multiple layers:

Patient records

Clinical observations

Physiological signals

Population-level trends

Healthcare facility capacity

Medical resource availability

Operational decisions

These layers are frequently viewed independently.

This creates a gap between understanding what is happening to an individual patient, identifying what is emerging across a population, and understanding what healthcare facilities may need to respond effectively.

CARE & CTRL addresses this gap by connecting these layers into one healthcare decision-support environment.

💡 Healthcare Use Case

CARE & CTRL is designed for healthcare organizations, hospitals, clinics and primary healthcare networks.

The platform connects:

Patient Intelligence → Population Intelligence → Facility Intelligence → Resource Intelligence → Human Action

A healthcare organization can use the platform to:

Connect or upload healthcare data.

Build a longitudinal patient context.

Observe available patient-level signals.

Identify population-level patterns.

Understand facility and PHC operational pressure.

Evaluate resource availability and demand.

Generate explainable action options.

Simulate possible operational scenarios.

Allow a human decision-maker to approve or reject an action.

Maintain an audit trail of decisions.

🔄 CARE & CTRL Decision Loop

                 DATA
                   │
                   ▼
        ┌─────────────────────┐
        │  Patient Digital    │
        │       Twin          │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Risk & Signal       │
        │ Intelligence        │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Population          │
        │ Intelligence        │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Facility / PHC      │
        │ Pressure            │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Resource Forecast   │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Action Options      │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ What-if Simulation  │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Human Approval      │
        │ Approve / Reject    │
        └──────────┬──────────┘
                   │
                   ▼
             AUDIT / OUTCOME

✨ Key Features

1. Hospital & Data Explorer

The Explorer provides a starting point for connecting healthcare data.

Supported workflows include:

Healthcare file upload

CSV ingestion

JSON ingestion

FHIR data

Authorized FHIR endpoints

Healthcare source discovery

Source freshness tracking

Data provenance

The platform clearly distinguishes imported datasets from connected sources.

2. Patient Digital Twin

CARE & CTRL provides a longitudinal representation of available patient information.

The Patient 360 view can contain:

Demographics

Health signals

Diagnoses

Medications

Patient attributes

Documents

Data-source information

Signal timestamps

The objective is to provide a unified patient context rather than requiring healthcare users to inspect disconnected information.

3. Population Dashboard

Patient-level information can be aggregated into population-level intelligence.

The Population Dashboard provides visibility into:

Risk bands

Population trends

Signal distributions

Cohort patterns

Emerging areas of pressure

This creates the connection:

Individual Signals
       ↓
Population Patterns
       ↓
Healthcare Planning

4. PHC Network

The PHC Network provides a facility-level operational view.

It can represent:

Facility status

Capacity

Resource availability

Operational pressure

Facility-level actions

Patient clinical information and operational resource information are maintained as separate data domains.

5. Resource Forecasting

The Resources workspace provides visibility into resource pressure.

Example resources include:

IV Fluids

Oxygen Cylinders

Paracetamol

Insulin

Test Strips

PPE Kits

The system can surface scenarios involving:

Low stock

Reorder pressure

Potential redistribution

Replenishment requirements

6. Action Center

The Action Center converts identified operational pressure into structured actions.

Examples include:

Redistribute resources

Replenish stock

Review a respiratory cohort

Open additional capacity

Validate source freshness

Actions can contain:

Action type

Target

Rationale

Expected impact

Status

Approval information

Audit information

7. What-if Simulation

CARE & CTRL allows users to explore operational scenarios before approving an action.

Example:

Current Resource State
          ↓
Proposed Redistribution
          ↓
Simulated Result
          ↓
Human Review
          ↓
Approve / Reject

This supports human decision-making by allowing potential operational effects to be examined before an action is approved.

8. AI Copilot

CARE & CTRL includes a grounded AI Copilot powered by Google Gemini.

The Copilot can assist with:

Application navigation

Healthcare source discovery

Opening patient records

Starting data-upload workflows

Opening workspaces

Explaining available application information

Context-aware application assistance

The AI layer is designed to remain grounded in available application context.

It is not intended to invent:

Patient measurements

Diagnoses

Hospital facts

Resource levels

Live operational conditions

9. Connect with AI

CARE & CTRL includes a dedicated AI workspace.

Features include:

AI chat

Voice input

Voice output

Language selection

Context-aware suggestions

Application actions

Supported language options include:

English

Tamil

Hindi

Telugu

Kannada

Malayalam

Bengali

Marathi

Gujarati

10. Multi-Hospital Workspace

The platform supports workspace-level separation.

Workspace-scoped information can include:

Patients

Patient signals

Data sources

PHC facilities

Resource inventory

Actions

Reports

Audit events

Feedback

This provides the foundation for deployment across multiple healthcare environments.

🔌 Healthcare Data Integration

CARE & CTRL supports multiple healthcare data formats.

File Formats

CSV

JSON

TXT

PDF

DOC

DOCX

XLS

XLSX

PNG

JPG

JPEG

FHIR Integration

The live FHIR integration layer supports:

Patient

Observation

Condition

Encounter

MedicationRequest

Patient information is only displayed when it is actually available from the connected source.

📊 Data Trust Model

CARE & CTRL explicitly distinguishes between different data states.

LIVE

Data retrieved from an actively connected external source.

IMPORTED SNAPSHOT

Data uploaded by the user and processed as a fixed dataset.

SIMULATED

Explicitly generated demonstration or operational scenario data.

This prevents simulated information from being represented as real-world hospital information.

🧪 Demonstration / Simulation Mode

CARE & CTRL includes a clearly labelled:

SIMULATED OPERATIONAL SCENARIO

The demonstration environment is designed to show the operational decision-support workflow without representing synthetic operational information as real hospital information.

The scenario contains:

Simulated PHC facilities

Simulated resource inventory

Population risk scenarios

Resource pressure scenarios

Action recommendations

Redistribution scenarios

Human approval workflow

Session audit information

Example Scenario

A facility approaches its resource reorder threshold while another facility has transferable stock.

CARE & CTRL can:

Identify the operational pressure.

Surface a potential redistribution scenario.

Simulate the expected operational effect.

Present the action for human review.

Allow the operator to approve or reject the action.

Record the decision.

🧠 AI / ML Model & Framework Details

AI Framework

Google Gemini

CARE & CTRL uses Gemini as a grounded AI assistance layer for application interaction and healthcare-context understanding.

AI Design

The AI layer is designed around:

Grounded responses

Application context

Explainability

Human approval

Source awareness

Safety boundaries

Important Design Principle

CARE & CTRL does not position the AI Copilot as an autonomous clinical decision-maker.

The platform is designed to support healthcare professionals and operational decision-makers while keeping human review in the decision loop.

🏗️ Technical Architecture

┌───────────────────────────────────────────────┐
│                  DATA SOURCES                 │
│                                               │
│ CSV │ JSON │ FHIR │ EHR │ IoT │ Wearables   │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│               DATA INGESTION                  │
│                                               │
│ Validation │ Normalization │ Provenance       │
│ Freshness  │ Source Tracking                 │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│              PATIENT DIGITAL TWIN             │
│                                               │
│ Profile │ Signals │ Diagnoses │ Medications  │
│ Attributes │ Documents │ History              │
└───────────────────────┬───────────────────────┘
                        │
              ┌─────────┴──────────┐
              ▼                    ▼
┌──────────────────────┐ ┌─────────────────────┐
│ PATIENT INTELLIGENCE │ │ POPULATION          │
│                      │ │ INTELLIGENCE        │
│ Signals & Risk       │ │ Trends & Cohorts    │
└──────────┬───────────┘ └──────────┬──────────┘
           │                        │
           └────────────┬───────────┘
                        ▼
┌───────────────────────────────────────────────┐
│              FACILITY / PHC LAYER             │
│                                               │
│ Capacity │ Resources │ Demand │ Pressure      │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│               RESOURCE LAYER                  │
│                                               │
│ Demand │ Reorder │ Availability │ Transfers   │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                 ACTION CENTER                 │
│                                               │
│ Recommendations │ Rationale │ Expected Impact │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│              WHAT-IF SIMULATION               │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│              HUMAN APPROVAL                   │
│                                               │
│              APPROVE / REJECT                 │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
                 AUDIT / OUTCOME

🛠️ Technical Stack

Frontend

HTML

CSS

JavaScript

Responsive Web UI

Web Speech APIs

Backend

JavaScript API routes

REST-style APIs

PostgreSQL

SQL migrations

AI

Google Gemini

Grounded AI Copilot

Context-aware application actions

Healthcare Interoperability

HL7 FHIR

Patient

Observation

Condition

Encounter

MedicationRequest

Data Processing

CSV

JSON

PDF

DOC / DOCX

XLS / XLSX

Image OCR

Deployment

Hatchable

PostgreSQL

GitHub

📁 Repository Structure

CARE-CTRL/
│
├── api/
│   ├── actions/
│   ├── copilot/
│   ├── data/
│   ├── explorer/
│   ├── feedback/
│   ├── hospital/
│   ├── metrics/
│   ├── patients/
│   ├── phc/
│   ├── reports/
│   ├── resources/
│   ├── signals/
│   └── system/
│
├── migrations/
│   ├── database schema
│   ├── patient data
│   ├── healthcare sources
│   ├── PHC facilities
│   ├── resource inventory
│   ├── actions
│   └── workspace isolation
│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── app.js
│   ├── theme.css
│   └── logo.svg
│
├── hatchable.toml
├── package.json
└── README.md

🚀 Live Demo

CARE & CTRL

Live Application:

https://care-ctrl.hatchable.site

The live application demonstrates the submitted CARE & CTRL implementation.

🎥 Demo Video

15–20 Minute Demo

The complete project demonstration is available as an unlisted YouTube video.

Demo Video:

ADD UNLISTED YOUTUBE LINK HERE

The demonstration covers:

Problem statement

CARE & CTRL overview

Data Explorer

Patient Digital Twin

Population Dashboard

PHC Network

Resource Forecasting

Action Center

What-if Simulation

AI Copilot

End-to-end workflow

Technical architecture

Key implementation details

📊 Presentation

Short Pitch Presentation

PDF:

ADD PRESENTATION PDF LINK HERE

PPT:

ADD PRESENTATION PPT LINK HERE

The presentation covers the project problem, healthcare use case, solution, architecture, technology stack, AI integration, workflow and outcomes.

🏗️ Architecture Diagram

Architecture PDF/PPT:

ADD ARCHITECTURE PDF/PPT LINK HERE

⚙️ Setup Instructions

Prerequisites

Git

Node.js

npm

PostgreSQL-compatible database

Required AI/API credentials

Modern web browser

Clone the Repository

git clone YOUR_PUBLIC_GITHUB_REPOSITORY_URL
cd CARE-CTRL

Install Dependencies

npm install

Environment Configuration

Create the required environment configuration using the provided example configuration.

Do not commit secrets to GitHub.

Typical environment configuration includes:

AI / Gemini credentials
Authentication configuration
External healthcare API credentials
FHIR endpoint credentials
Database configuration

Database

The repository contains SQL migrations used to create the application database schema.

The database includes entities for:

Patients

Patient signals

Diagnoses

Medications

Data sources

Hospitals

Hospital members

PHC facilities

Resource inventory

Actions

Audit events

Feedback

Run the Application

npm run dev

The application can then be accessed through the local development URL provided by the runtime.

🔒 Security & Data Handling

Sensitive information must never be committed to the repository.

Do not commit:

.env
.env.local
API keys
OAuth secrets
Access tokens
Private credentials
Real patient-identifying information

The repository is intended to contain source code and configuration templates, not private healthcare records or credentials.

🛡️ Safety Principles

CARE & CTRL follows these principles:

No fabricated patient information

Patient records are only associated with sources that actually provide the records.

No fake live data

Uploaded datasets are explicitly labelled as imported snapshots.

Operational data separation

Patient clinical information is not treated as a substitute for facility inventory or operational capacity.

Human-in-the-loop

Healthcare and operational decisions remain subject to human review.

Source transparency

Data source and freshness information are surfaced where applicable.

Auditability

Important actions and decisions can be recorded for later review.

📈 Expected Impact

CARE & CTRL is designed to support healthcare organizations by connecting information that is often separated across different operational layers.

Potential areas of application include:

Earlier identification of emerging population pressure

Improved visibility across healthcare facilities

Resource planning

PHC coordination

Operational scenario planning

Evidence-supported decision-making

Human-reviewed healthcare operations

The prototype demonstrates how patient, population and operational intelligence can be connected within one decision-support environment.

🔮 Future Scope

Future versions of CARE & CTRL can extend the platform with:

More real-time wearable integrations

Additional FHIR resources

Advanced time-series forecasting

More sophisticated predictive models

Edge AI inference

On-device healthcare intelligence

Larger PHC and hospital networks

Advanced interoperability

Additional healthcare operational datasets

More comprehensive outcome tracking

📜 Open-Source License

This project is released under the MIT License.

See the LICENSE file for the complete license text.

📝 Project Resources

Resource

Link

🌐 Live Demo

https://care-ctrl.hatchable.site

💻 GitHub Repository

This repository

🎥 Demo Video

ADD UNLISTED YOUTUBE LINK

📄 Pitch PDF

ADD PRESENTATION PDF LINK

📊 Pitch PPT

ADD PRESENTATION PPT LINK

🏗️ Architecture

ADD ARCHITECTURE PDF/PPT LINK

🏆 Submission Checklist

Team details

College / institution information

Project title

Problem statement

Healthcare use case

Technical stack

AI / ML framework details

15–20 minute unlisted YouTube demo video

Open-source license information

Architecture diagram PDF/PPT

Project presentation PDF/PPT

Public GitHub repository

All required links publicly accessible

❤️ CARE & CTRL

See earlier. Decide smarter.

Team Ctrl+Ai

Noorul Aslina M • Karthikeyan M

Saveetha Engineering College
