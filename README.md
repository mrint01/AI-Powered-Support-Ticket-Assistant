🎟️ AI-Powered Support Ticket Assistant

A full-stack, cloud-deployed support ticket system that uses AI to summarize, prioritize, and suggest responses for customer tickets.
Built as a learning + portfolio project to demonstrate real-world backend, frontend, DevOps, and AI integration skills.

🚀 Live Architecture (Production)
[ React Frontend ]

        |
        v

[ AWS ALB / CloudFront ]

        |
        +--> NestJS API (Auth, Tickets, AI)
        |
        +--> Spring Boot Service (Workflow Engine)
        |
        v

[ PostgreSQL (AWS RDS) ]


Frontend, NestJS, and Spring Boot are Dockerized

Deployed on AWS ECS + ALB

CI/CD via GitHub Actions

Images stored in AWS ECR

✨ Features
🎫 Ticket Management

Create, update, delete support tickets

Ticket status history (Open → In Progress → Resolved)

User-specific ticket views

Admin dashboard (all tickets, filters)

🤖 AI Integration (OpenAI)

Automatic ticket summary

Automatic priority classification

AI-generated suggested response for support agents

🔐 Authentication & Security

JWT-based authentication

Role-based access (User / Admin)

Protected routes (frontend & backend)

DTO validation & request sanitization

⚙️ Microservices

NestJS: API gateway, auth, tickets, AI logic

Spring Boot: Internal workflow engine (status changes, processing)

HTTP communication between services

🧱 Tech Stack
Frontend

React + Vite

TypeScript

Tailwind CSS

React Router

Backend

NestJS (Node.js)

Spring Boot (Java)

PostgreSQL

TypeORM / JPA

AI

OpenAI API (GPT models)

DevOps / Cloud

Docker & Docker Compose

AWS (ECS, ECR, ALB, RDS, S3, CloudFront)

GitHub Actions (CI/CD)

🧪 Testing & Quality

Unit tests (NestJS)

Integration / E2E tests (Jest + Supertest)

DTO-based API validation

Global validation pipes

Environment-based configs (dev / prod)

🔄 CI/CD Pipeline

On every push to main:

Checkout repository

Install dependencies

Build frontend & backends

Run unit + integration tests

Build Docker images

Push images to AWS ECR

Deploy updated services to AWS ECS

No manual deployment required 🚀

📁 Repository Structure
.
├── client/                # React frontend
├── server/                # NestJS backend
├── BackendTicketSupport/  # Spring Boot service
├── docker-compose.yml     # Local development
├── .github/workflows/     # CI/CD pipelines
└── README.md

🧠 8-Week Project Roadmap (Completed)
✅ Week 1 – Core Setup

Frontend + backend setup

Ticket creation

AI summarization & priority

PostgreSQL integration

✅ Week 2 – Auth & User Flow

JWT login/register

User-specific tickets

Protected routes

✅ Week 3 – Admin + Spring Boot

Admin interface

Spring Boot workflow service

Service-to-service communication

✅ Week 4 – Docker & Cloud Basics

Dockerfiles for all services

Local Docker Compose

Initial AWS deployment

✅ Week 5 – AI Improvements

Suggested responses

Ticket categorization

Status history

✅ Week 6 – Full Cloud + CI/CD

AWS ECS + RDS

GitHub Actions pipeline

Automated deployment

✅ Week 7 – Testing & Security

Unit & integration tests

DTO validation

Role guards, CORS, HTTPS

✅ Week 8 – Finalization

Documentation

Demo readiness

🛠️ Local Development
# Start everything locally
docker-compose up --build


Services:

Frontend: http://localhost:5173

NestJS API: http://localhost:3000

Spring Boot: http://localhost:8080

🎯 Why This Project?

This project was built to simulate real production systems, not tutorials:

Real CI/CD

Real cloud deployment

Real auth & validation

Real AI usage

Real microservice communication

It reflects how modern teams build, deploy, and scale applications.

📌 Author

Hatem Sfar
Full-Stack Software Engineer
React • NestJS • Spring Boot • AWS • AI

This project is part of my professional portfolio.
