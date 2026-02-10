// Daytona mapping based on latest main branch (2026-02)
// https://github.com/daytonaio/daytona
// Daytona codebase visualization — mapped by Legend

import type { GraphNode, GraphEdge } from "./demoData";

// ============================================================
// L1 — CONTEXT LEVEL
// ============================================================

export const daytonaContextNodes: GraphNode[] = [
  {
    id: "daytona-system",
    label: "Daytona",
    type: "component",
    description: "Secure and elastic infrastructure for running AI-generated code. Provides sub-90ms sandbox creation, isolated execution environments, file/git/LSP/execute APIs, and OCI/Docker compatibility.",
    stats: "TypeScript 45% • Go 42% • Python 8%",
    level: "context",
    purpose: "Daytona is the infrastructure platform that lets AI agents and developers programmatically create, manage, and execute code inside secure, isolated sandbox environments.",
  },
  // Actors
  {
    id: "d-actor-ai-developers",
    label: "AI Developers",
    type: "actor",
    description: "Engineers building AI agents and applications that need to execute AI-generated code safely. Use Daytona SDKs to create sandboxes programmatically.",
    stats: "Primary users",
    level: "context",
  },
  {
    id: "d-actor-platform-engineers",
    label: "Platform Engineers",
    type: "actor",
    description: "Engineers who deploy and manage Daytona infrastructure, configure runners, regions, registries, and organization settings via the dashboard.",
    stats: "Infrastructure operators",
    level: "context",
  },
  {
    id: "d-actor-sdk-users",
    label: "SDK Users",
    type: "actor",
    description: "Developers using Daytona Python, TypeScript, Go, or Ruby SDKs to integrate sandbox creation into their applications and AI workflows.",
    stats: "SDK integrators",
    level: "context",
  },
  // External systems
  {
    id: "d-ext-docker",
    label: "Docker / OCI Runtime",
    type: "external",
    description: "Container runtime used by runners to create and manage sandbox containers. Supports any OCI/Docker-compatible image.",
    stats: "Container runtime",
    level: "context",
  },
  {
    id: "d-ext-git-providers",
    label: "Git Providers",
    type: "external",
    description: "GitHub, GitLab, Bitbucket — source code hosting platforms. Sandboxes can clone repositories and perform git operations.",
    stats: "GitHub / GitLab / Bitbucket",
    level: "context",
  },
  {
    id: "d-ext-oci-registries",
    label: "OCI Registries",
    type: "external",
    description: "Docker Hub, GHCR, ECR, and custom registries for pulling base images and pushing sandbox snapshots.",
    stats: "Image registries",
    level: "context",
  },
  {
    id: "d-ext-object-storage",
    label: "Object Storage",
    type: "external",
    description: "S3-compatible storage (MinIO, AWS S3) for sandbox backups, volume data, and persistent file storage.",
    stats: "S3 / MinIO",
    level: "context",
  },
  {
    id: "d-ext-identity",
    label: "Identity Provider",
    type: "external",
    description: "Dex OIDC server handling authentication. Supports SSO with Google, GitHub, and other OAuth/OIDC providers via Auth0.",
    stats: "OIDC / Auth0 / Dex",
    level: "context",
  },
];

export const daytonaContextEdges: GraphEdge[] = [
  { id: "d-ctx-e1", source: "d-actor-ai-developers", target: "daytona-system", type: "call", label: "Create & manage sandboxes" },
  { id: "d-ctx-e2", source: "d-actor-platform-engineers", target: "daytona-system", type: "call", label: "Configure infrastructure" },
  { id: "d-ctx-e3", source: "d-actor-sdk-users", target: "daytona-system", type: "call", label: "SDK integration" },
  { id: "d-ctx-e4", source: "daytona-system", target: "d-ext-docker", type: "call", label: "Container lifecycle" },
  { id: "d-ctx-e5", source: "daytona-system", target: "d-ext-git-providers", type: "call", label: "Git operations" },
  { id: "d-ctx-e6", source: "daytona-system", target: "d-ext-oci-registries", type: "call", label: "Pull/push images" },
  { id: "d-ctx-e7", source: "daytona-system", target: "d-ext-object-storage", type: "data", label: "Sandbox backups" },
  { id: "d-ctx-e8", source: "daytona-system", target: "d-ext-identity", type: "call", label: "Authentication" },
];

// ============================================================
// L2 — SYSTEM / CONTAINER LEVEL
// ============================================================

export const daytonaSystemNodes: GraphNode[] = [
  {
    id: "d-api-server",
    label: "NestJS API Server",
    type: "api",
    description: "TypeScript/NestJS application serving the REST API. Handles sandbox lifecycle, organization management, runner coordination, authentication, webhooks, and the OpenAPI spec. Uses TypeORM with PostgreSQL and Redis for caching/rate-limiting.",
    stats: "TypeScript • NestJS • ~463 source files",
    level: "system",
    architecture: "NestJS modular architecture with 19 domain modules. TypeORM entities with PostgreSQL. Redis for rate limiting and caching. Event-driven with NestJS EventEmitter. Kafka for audit log publishing.",
    technicalSpecs: [
      { title: "Framework", details: "NestJS with TypeORM, throttler, event-emitter" },
      { title: "Auth", details: "OIDC via Dex + API key authentication" },
      { title: "Modules", details: "Sandbox, Organization, Auth, Runner, Snapshot, Volume, Region, Webhook, Usage, Admin" },
    ],
    connections: {
      inputs: [
        { name: "Dashboard", id: "d-dashboard" },
        { name: "CLI", id: "d-cli" },
        { name: "SDKs", id: "d-sdks" },
      ],
      outputs: [
        { name: "Runner", id: "d-runner" },
        { name: "Infrastructure", id: "d-infra" },
      ],
    },
    dependencies: {
      external: ["@nestjs/core", "@nestjs/typeorm", "ioredis", "@nestjs/throttler"],
      internal: ["apps/api/src"],
    },
  },
  {
    id: "d-dashboard",
    label: "React Dashboard",
    type: "component",
    description: "Single-page React/TypeScript application providing the Daytona web UI. Includes sandbox management, snapshot browser, runner monitoring, organization settings, API key management, audit logs, and usage analytics.",
    stats: "TypeScript • React • Vite • ~258 source files",
    level: "system",
    architecture: "React SPA bundled by Vite, served as static assets by the API server. Uses Tailwind CSS for styling. React Query for data fetching.",
    technicalSpecs: [
      { title: "Framework", details: "React with Vite, Tailwind CSS, shadcn-ui" },
      { title: "Pages", details: "24 pages: Sandboxes, Snapshots, Volumes, Runners, Regions, Registries, etc." },
      { title: "Hosting", details: "Static build served by NestJS ServeStaticModule" },
    ],
    connections: {
      inputs: [],
      outputs: [{ name: "NestJS API Server", id: "d-api-server" }],
    },
    dependencies: {
      external: ["react", "vite", "tailwindcss"],
      internal: ["apps/dashboard/src"],
    },
  },
  {
    id: "d-runner",
    label: "Runner Service",
    type: "utility",
    description: "Go service that executes sandbox lifecycle operations on a host machine. Manages Docker containers, handles snapshot builds, enforces network rules, monitors system metrics, and provides an HTTP API for the control plane.",
    stats: "Go • Docker SDK • ~94 source files",
    level: "system",
    architecture: "Singleton runner with Docker client, sandbox service, network rules manager, SSH gateway, and metrics collector. Polls the API server for jobs and executes them. Exposes its own HTTP API for health and proxy endpoints.",
    technicalSpecs: [
      { title: "Runtime", details: "Go binary with Docker SDK client" },
      { title: "Job Model", details: "Polls API for pending jobs (create, start, stop, destroy, snapshot)" },
      { title: "Storage", details: "MinIO/S3 client for backup/restore" },
    ],
    connections: {
      inputs: [{ name: "NestJS API Server", id: "d-api-server" }],
      outputs: [
        { name: "Daemon", id: "d-daemon" },
        { name: "Infrastructure", id: "d-infra" },
      ],
    },
    dependencies: {
      external: ["docker/docker", "minio/minio-go", "gin-gonic/gin"],
      internal: ["apps/runner"],
    },
  },
  {
    id: "d-daemon",
    label: "Daemon (Toolbox Agent)",
    type: "config",
    description: "Go agent running inside each sandbox container. Exposes the Toolbox API (REST) for filesystem operations, git, LSP, process execution, PTY sessions, SSH, and computer use. This is the in-sandbox control plane.",
    stats: "Go • Gin HTTP • ~112 source files",
    level: "system",
    architecture: "Gin HTTP server with Swagger docs. Modular handlers for fs, git, lsp, process (PTY, interpreter, session), SSH server, and computer use via RPC. Starts automatically when sandbox container boots.",
    technicalSpecs: [
      { title: "Framework", details: "Gin HTTP server with Swagger" },
      { title: "APIs", details: "Filesystem, Git, LSP, Process (exec, PTY, REPL), SSH, Computer Use" },
      { title: "Transport", details: "REST API + WebSocket for PTY/interpreter sessions" },
    ],
    connections: {
      inputs: [{ name: "Runner", id: "d-runner" }],
      outputs: [],
    },
    dependencies: {
      external: ["gin-gonic/gin", "go-git/go-git", "gliderlabs/ssh"],
      internal: ["apps/daemon"],
    },
  },
  {
    id: "d-cli",
    label: "CLI",
    type: "api",
    description: "Go command-line interface for Daytona. Provides commands for sandbox lifecycle (create, start, stop, delete, exec, ssh), snapshot management, volume operations, organization management, auth, and MCP server integration.",
    stats: "Go • Cobra • ~94 source files",
    level: "system",
    architecture: "Cobra CLI with subcommands organized by domain. Uses the generated API client to communicate with the Daytona API server. Supports SSH tunneling to sandboxes.",
    technicalSpecs: [
      { title: "Framework", details: "Cobra CLI with Bubble Tea TUI views" },
      { title: "Commands", details: "sandbox, snapshot, volume, organization, auth, mcp, docs" },
      { title: "MCP", details: "Model Context Protocol server for AI agent integration (Claude, Cursor, Windsurf)" },
    ],
    connections: {
      inputs: [],
      outputs: [{ name: "NestJS API Server", id: "d-api-server" }],
    },
    dependencies: {
      external: ["spf13/cobra", "charmbracelet/bubbletea"],
      internal: ["apps/cli"],
    },
  },
  {
    id: "d-proxy",
    label: "Reverse Proxy",
    type: "api",
    description: "Go HTTP reverse proxy routing external requests to the correct sandbox or snapshot container. Handles authentication callbacks, sandbox/snapshot target resolution, and preview URLs.",
    stats: "Go • net/http • ~10 source files",
    level: "system",
    architecture: "HTTP reverse proxy with target resolution. Routes requests based on subdomain/path to the appropriate runner and sandbox container. Handles OAuth callback for sandbox web previews.",
    technicalSpecs: [
      { title: "Runtime", details: "Go binary with net/http reverse proxy" },
      { title: "Routing", details: "Subdomain-based routing to sandbox containers via runner endpoints" },
      { title: "Auth", details: "OAuth callback handling for sandbox web preview access" },
    ],
    connections: {
      inputs: [],
      outputs: [
        { name: "Runner", id: "d-runner" },
        { name: "NestJS API Server", id: "d-api-server" },
      ],
    },
    dependencies: {
      external: ["net/http"],
      internal: ["apps/proxy"],
    },
  },
  {
    id: "d-ssh-gateway",
    label: "SSH Gateway",
    type: "api",
    description: "Go service providing SSH access to sandboxes. Acts as a jump host, authenticating users and forwarding SSH connections to the correct sandbox daemon.",
    stats: "Go • crypto/ssh • 1 source file",
    level: "system",
    architecture: "SSH jump host that authenticates incoming connections against the API server, resolves the target sandbox, and proxies the SSH session to the daemon's embedded SSH server inside the container.",
    technicalSpecs: [
      { title: "Runtime", details: "Go binary with golang.org/x/crypto/ssh" },
      { title: "Auth", details: "API key or JWT-based authentication via API server lookup" },
      { title: "Transport", details: "SSH protocol forwarding to sandbox daemon SSH server" },
    ],
    connections: {
      inputs: [],
      outputs: [{ name: "Daemon", id: "d-daemon" }],
    },
    dependencies: {
      external: ["golang.org/x/crypto/ssh"],
      internal: ["apps/ssh-gateway"],
    },
  },
  {
    id: "d-sdks",
    label: "Multi-Language SDKs",
    type: "component",
    description: "Client SDKs in Python, TypeScript, Go, and Ruby. Provide high-level abstractions for sandbox creation, code execution, file operations, and git management. Also includes generated API clients and toolbox API clients.",
    stats: "Python • TypeScript • Go • Ruby • ~147 source files",
    level: "system",
    architecture: "Each SDK wraps the generated OpenAPI client with ergonomic, language-idiomatic APIs. Python SDK is the most mature. Toolbox API clients are auto-generated from Swagger specs.",
    technicalSpecs: [
      { title: "Languages", details: "Python (PyPI), TypeScript (npm), Go (module), Ruby (gem)" },
      { title: "API Clients", details: "Auto-generated from OpenAPI spec for both main API and Toolbox API" },
      { title: "Pattern", details: "High-level Daytona class wrapping generated clients with idiomatic APIs" },
    ],
    connections: {
      inputs: [],
      outputs: [
        { name: "NestJS API Server", id: "d-api-server" },
        { name: "Daemon", id: "d-daemon" },
      ],
    },
    dependencies: {
      external: [],
      internal: ["libs/sdk-python", "libs/sdk-typescript", "libs/sdk-go", "libs/sdk-ruby"],
    },
  },
  {
    id: "d-infra",
    label: "Infrastructure",
    type: "data",
    description: "PostgreSQL (state storage via TypeORM), Redis (caching, rate limiting, TypeORM cache), Dex (OIDC identity provider), Docker (container runtime), MinIO/S3 (object storage), Docker Registry (snapshot images).",
    stats: "PostgreSQL • Redis • Dex • Docker • S3 • Registry",
    level: "system",
    architecture: "Managed or self-hosted infrastructure. PostgreSQL stores all application state. Redis provides caching and rate limiting. Dex handles OIDC authentication. Docker runs sandbox containers. MinIO/S3 stores backups. Private Docker Registry stores snapshot images.",
    technicalSpecs: [
      { title: "Database", details: "PostgreSQL 15 with TypeORM migrations" },
      { title: "Cache", details: "Redis 7 for rate limiting, query cache, and distributed locks" },
      { title: "Identity", details: "Dex OIDC provider with configurable connectors" },
      { title: "Storage", details: "MinIO/S3 for backups, Docker Registry 2.8.2 for snapshots" },
    ],
    connections: {
      inputs: [
        { name: "NestJS API Server", id: "d-api-server" },
        { name: "Runner", id: "d-runner" },
      ],
      outputs: [],
    },
    dependencies: {
      external: ["postgresql", "redis", "dex", "docker", "minio"],
      internal: [],
    },
  },
];

export const daytonaSystemEdges: GraphEdge[] = [
  // Dashboard → API
  { id: "d-se-dash-api", source: "d-dashboard", target: "d-api-server", type: "call", label: "REST API calls" },
  { id: "d-se-api-dash", source: "d-api-server", target: "d-dashboard", type: "data", label: "JSON responses" },

  // CLI → API
  { id: "d-se-cli-api", source: "d-cli", target: "d-api-server", type: "call", label: "API requests" },

  // SDKs → API
  { id: "d-se-sdks-api", source: "d-sdks", target: "d-api-server", type: "call", label: "SDK API calls" },

  // API → Runner (job dispatch)
  { id: "d-se-api-runner", source: "d-api-server", target: "d-runner", type: "call", label: "Job dispatch" },
  { id: "d-se-runner-api", source: "d-runner", target: "d-api-server", type: "data", label: "Status updates" },

  // Runner → Daemon (sandbox control)
  { id: "d-se-runner-daemon", source: "d-runner", target: "d-daemon", type: "call", label: "Toolbox API" },

  // Proxy → Runner
  { id: "d-se-proxy-runner", source: "d-proxy", target: "d-runner", type: "call", label: "Route to sandbox" },
  { id: "d-se-proxy-api", source: "d-proxy", target: "d-api-server", type: "call", label: "Auth & lookup" },

  // SSH Gateway → Daemon
  { id: "d-se-ssh-daemon", source: "d-ssh-gateway", target: "d-daemon", type: "call", label: "SSH forwarding" },

  // API → Infrastructure
  { id: "d-se-api-infra", source: "d-api-server", target: "d-infra", type: "data", label: "PostgreSQL + Redis" },

  // Runner → Infrastructure
  { id: "d-se-runner-infra", source: "d-runner", target: "d-infra", type: "call", label: "Docker + S3" },

  // SDKs → Daemon (Toolbox API via proxy)
  { id: "d-se-sdks-daemon", source: "d-sdks", target: "d-daemon", type: "call", label: "Toolbox API (via proxy)" },
];

// ============================================================
// L3 — MODULE / COMPONENT LEVEL
// ============================================================

export const daytonaModuleNodes: GraphNode[] = [
  // ===== API SERVER GROUP =====
  {
    id: "d-mod-sandbox",
    label: "Sandbox Module",
    type: "api",
    description: "Core NestJS module managing the entire sandbox lifecycle. Controllers for sandbox CRUD, snapshots, volumes, runners, jobs, and previews. Services handle state machines, warm pools, job orchestration, and runner adapter communication.",
    stats: "apps/api/src/sandbox/ • ~130 TS files",
    level: "module",
    group: "d-api",
    purpose: "The heart of Daytona — orchestrates sandbox creation, start, stop, archive, and destroy operations. Manages the job queue that runners poll for work.",
    howItWorks: {
      overview: "Event-driven sandbox lifecycle with job-based execution. API creates sandbox records and jobs, runners poll and execute them.",
      workflow: [
        { step: 1, description: "Client requests sandbox creation via REST API" },
        { step: 2, description: "SandboxService creates entity in PostgreSQL with 'pending' state" },
        { step: 3, description: "Job is created for the assigned runner to execute" },
        { step: 4, description: "Runner polls for jobs, picks up the create job" },
        { step: 5, description: "Runner creates Docker container, starts daemon, reports success" },
        { step: 6, description: "API updates sandbox state to 'started', notifies via webhook" },
      ],
    },
    connections: {
      inputs: [{ name: "Dashboard Pages", id: "d-mod-dashboard-pages" }],
      outputs: [
        { name: "Runner Management", id: "d-mod-runner-mgmt" },
        { name: "Job Service", id: "d-mod-jobs" },
      ],
    },
    dependencies: {
      external: ["@nestjs/typeorm", "ioredis"],
      internal: ["apps/api/src/sandbox"],
    },
  },
  {
    id: "d-mod-organization",
    label: "Organization Module",
    type: "api",
    description: "Multi-tenant organization management. Handles organization CRUD, user invitations, role-based access control, region quotas, usage tracking, and resource permissions.",
    stats: "apps/api/src/organization/ • ~60 TS files",
    level: "module",
    group: "d-api",
    connections: {
      inputs: [{ name: "Auth Module", id: "d-mod-auth" }],
      outputs: [],
    },
    dependencies: {
      external: ["@nestjs/typeorm"],
      internal: [],
    },
  },
  {
    id: "d-mod-auth",
    label: "Auth Module",
    type: "utility",
    description: "Authentication module supporting OIDC (via Dex) and API key authentication. Guards protect routes based on authentication method and organization membership.",
    stats: "apps/api/src/auth/ + apps/api/src/api-key/",
    level: "module",
    group: "d-api",
    connections: {
      inputs: [],
      outputs: [{ name: "Organization Module", id: "d-mod-organization" }],
    },
    dependencies: {
      external: ["@nestjs/passport", "passport-jwt"],
      internal: [],
    },
  },
  {
    id: "d-mod-runner-mgmt",
    label: "Runner Management",
    type: "utility",
    description: "Server-side runner coordination. Handles runner registration, health monitoring, state tracking, job assignment, and unschedulable marking. The RunnerAdapter translates API calls to runner-specific HTTP endpoints.",
    stats: "apps/api/src/sandbox/services/runner.service.ts + controllers/runner.controller.ts",
    level: "module",
    group: "d-api",
    connections: {
      inputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
      outputs: [],
    },
    dependencies: {
      external: ["@nestjs/typeorm"],
      internal: [],
    },
  },
  {
    id: "d-mod-jobs",
    label: "Job System",
    type: "config",
    description: "Async job queue for sandbox operations. Jobs represent pending work (create, start, stop, destroy, snapshot) assigned to specific runners. JobStateHandler service processes state transitions.",
    stats: "apps/api/src/sandbox/services/job.service.ts + job-state-handler.service.ts",
    level: "module",
    group: "d-api",
    connections: {
      inputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
      outputs: [],
    },
    dependencies: {
      external: ["@nestjs/typeorm"],
      internal: [],
    },
  },
  {
    id: "d-mod-webhook",
    label: "Webhook & Events",
    type: "utility",
    description: "Event-driven webhook delivery system. Publishes sandbox, runner, snapshot, and volume state change events. Subscribers listen for entity changes and trigger webhook delivery.",
    stats: "apps/api/src/webhook/ + apps/api/src/sandbox/subscribers/",
    level: "module",
    group: "d-api",
    connections: {
      inputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
      outputs: [],
    },
    dependencies: {
      external: ["@nestjs/event-emitter"],
      internal: [],
    },
  },
  {
    id: "d-mod-region",
    label: "Region Module",
    type: "data",
    description: "Multi-region support for distributing sandboxes across geographic regions. Region controllers manage region CRUD and runner assignment per region.",
    stats: "apps/api/src/region/",
    level: "module",
    group: "d-api",
    connections: {
      inputs: [{ name: "Organization Module", id: "d-mod-organization" }],
      outputs: [],
    },
    dependencies: {
      external: ["@nestjs/typeorm"],
      internal: [],
    },
  },
  {
    id: "d-mod-api-common",
    label: "API Common",
    type: "config",
    description: "Shared API infrastructure: TypedConfig service, rate limiting middleware, version header middleware, maintenance mode, exception filters, Kafka audit consumer, OpenAPI generation, metrics interceptor.",
    stats: "apps/api/src/common/ + apps/api/src/config/ + apps/api/src/filters/",
    level: "module",
    group: "d-api",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: ["@nestjs/throttler", "nestjs-pino"],
      internal: [],
    },
  },
  {
    id: "d-mod-usage",
    label: "Usage & Analytics",
    type: "data",
    description: "Usage tracking and analytics modules. Track sandbox compute time, storage usage, and organization quotas. Analytics module for product telemetry.",
    stats: "apps/api/src/usage/ + apps/api/src/analytics/",
    level: "module",
    group: "d-api",
    connections: {
      inputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
      outputs: [],
    },
    dependencies: {
      external: ["@nestjs/typeorm"],
      internal: [],
    },
  },
  {
    id: "d-mod-docker-registry",
    label: "Docker Registry Module",
    type: "utility",
    description: "Manages container image registry configurations for organizations. Supports Docker Hub, GHCR, ECR, and custom registries. Controls which registries runners can pull sandbox images from.",
    stats: "apps/api/src/docker-registry/ • ~15 TS files",
    level: "module",
    group: "d-api",
    connections: {
      inputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
      outputs: [],
    },
    dependencies: {
      external: ["@nestjs/typeorm"],
      internal: [],
    },
  },
  {
    id: "d-mod-audit",
    label: "Audit Module",
    type: "data",
    description: "Audit logging for all organization-level operations. Records create, update, delete actions on sandboxes, runners, snapshots, volumes, and settings. Supports PostgreSQL, OpenSearch, and Kafka adapters for log storage and streaming.",
    stats: "apps/api/src/audit/ • ~20 TS files",
    level: "module",
    group: "d-api",
    connections: {
      inputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
      outputs: [{ name: "PostgreSQL", id: "d-infra-postgresql" }],
    },
    dependencies: {
      external: ["@nestjs/typeorm", "kafkajs"],
      internal: [],
    },
  },
  {
    id: "d-mod-user",
    label: "User Module",
    type: "utility",
    description: "User account management. Handles user CRUD, system roles, linked accounts (GitHub, GitLab), email verification, and profile settings. Users belong to one or more organizations with role-based access.",
    stats: "apps/api/src/user/ • ~15 TS files",
    level: "module",
    group: "d-api",
    connections: {
      inputs: [{ name: "Auth Module", id: "d-mod-auth" }],
      outputs: [{ name: "PostgreSQL", id: "d-infra-postgresql" }],
    },
    dependencies: {
      external: ["@nestjs/typeorm"],
      internal: [],
    },
  },
  {
    id: "d-mod-notification",
    label: "Notification Module",
    type: "utility",
    description: "In-app notification system with email delivery. Sends notifications for sandbox state changes, organization invitations, runner status, and quota warnings. Integrates with email service for out-of-app alerts.",
    stats: "apps/api/src/notification/ • ~12 TS files",
    level: "module",
    group: "d-api",
    connections: {
      inputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
      outputs: [],
    },
    dependencies: {
      external: ["@nestjs/event-emitter"],
      internal: [],
    },
  },

  // ===== DASHBOARD GROUP =====
  {
    id: "d-mod-dashboard-pages",
    label: "Dashboard Pages",
    type: "component",
    description: "24 page-level React components: Sandboxes, Snapshots, Volumes, Runners, Regions, Registries, Organization settings, API Keys, Audit Logs, Usage/Spending, Account Settings, Onboarding, and more.",
    stats: "apps/dashboard/src/pages/ • 24 pages",
    level: "module",
    group: "d-dashboard",
    connections: {
      inputs: [],
      outputs: [
        { name: "Dashboard Components", id: "d-mod-dashboard-components" },
        { name: "Dashboard API Layer", id: "d-mod-dashboard-api" },
      ],
    },
    dependencies: {
      external: ["react", "react-router-dom"],
      internal: [],
    },
  },
  {
    id: "d-mod-dashboard-components",
    label: "Dashboard Components",
    type: "component",
    description: "Reusable UI components: SandboxTable, RunnerTable, SnapshotTable, VolumeTable, RegionTable, RegistryTable with details sheets, create dialogs, command palette, sidebar, and shadcn-ui primitives.",
    stats: "apps/dashboard/src/components/ • ~55 components",
    level: "module",
    group: "d-dashboard",
    connections: {
      inputs: [{ name: "Dashboard Pages", id: "d-mod-dashboard-pages" }],
      outputs: [],
    },
    dependencies: {
      external: ["react", "tailwindcss", "@radix-ui"],
      internal: [],
    },
  },
  {
    id: "d-mod-dashboard-api",
    label: "Dashboard API Layer",
    type: "utility",
    description: "API integration layer with hooks, services, and contexts for data fetching. Includes billing API client, auth provider, and organization context management.",
    stats: "apps/dashboard/src/api/ + hooks/ + services/ + contexts/",
    level: "module",
    group: "d-dashboard",
    connections: {
      inputs: [{ name: "Dashboard Pages", id: "d-mod-dashboard-pages" }],
      outputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
    },
    dependencies: {
      external: ["react-query"],
      internal: [],
    },
  },

  // ===== RUNNER GROUP =====
  {
    id: "d-mod-docker",
    label: "Docker Manager",
    type: "utility",
    description: "Comprehensive Docker client wrapper. Handles container creation, start, stop, destroy, image pull/push/build, snapshot commit, network management, volume cleanup, resize, backup/restore, and container monitoring.",
    stats: "apps/runner/pkg/docker/ • ~25 Go files",
    level: "module",
    group: "d-runner",
    purpose: "The bridge between Daytona's sandbox abstraction and Docker's container API. Translates sandbox operations into Docker API calls.",
    connections: {
      inputs: [{ name: "Sandbox Executor", id: "d-mod-executor" }],
      outputs: [],
    },
    dependencies: {
      external: ["docker/docker", "docker/go-connections"],
      internal: [],
    },
  },
  {
    id: "d-mod-executor",
    label: "Sandbox Executor",
    type: "utility",
    description: "V2 executor handling sandbox and snapshot job execution. Processes create, start, stop, destroy, archive, and snapshot build operations. Coordinates Docker operations with state reporting back to the API.",
    stats: "apps/runner/pkg/runner/v2/executor/ • sandbox.go, snapshot.go, backup.go",
    level: "module",
    group: "d-runner",
    connections: {
      inputs: [{ name: "Job Poller", id: "d-mod-poller" }],
      outputs: [
        { name: "Docker Manager", id: "d-mod-docker" },
        { name: "Network Rules", id: "d-mod-netrules" },
      ],
    },
    dependencies: {
      external: [],
      internal: ["apps/runner/pkg/docker", "apps/runner/pkg/services"],
    },
  },
  {
    id: "d-mod-poller",
    label: "Job Poller",
    type: "config",
    description: "Polls the Daytona API server for pending jobs assigned to this runner. Dispatches jobs to the executor. Includes health check reporting.",
    stats: "apps/runner/pkg/runner/v2/poller/ + healthcheck/",
    level: "module",
    group: "d-runner",
    connections: {
      inputs: [],
      outputs: [
        { name: "Sandbox Executor", id: "d-mod-executor" },
        { name: "Runner Management", id: "d-mod-runner-mgmt" },
      ],
    },
    dependencies: {
      external: [],
      internal: ["apps/runner/pkg/apiclient"],
    },
  },
  {
    id: "d-mod-netrules",
    label: "Network Rules",
    type: "config",
    description: "Network egress control for sandboxes. Manages iptables-style rules to limit, assign, and unassign network access per sandbox container. Enforces organization-level network policies.",
    stats: "apps/runner/pkg/netrules/ • 7 Go files",
    level: "module",
    group: "d-runner",
    connections: {
      inputs: [{ name: "Sandbox Executor", id: "d-mod-executor" }],
      outputs: [],
    },
    dependencies: {
      external: [],
      internal: [],
    },
  },
  {
    id: "d-mod-runner-api",
    label: "Runner API",
    type: "api",
    description: "HTTP API exposed by the runner for health checks, sandbox info, command logs, snapshot operations, and proxy endpoints. Authenticated via bearer token. The runner also embeds the daemon binary, manages an SSH gateway config, and includes internal support packages (cache, models, apiclient, services, common).",
    stats: "apps/runner/pkg/api/ • server.go + controllers/",
    level: "module",
    group: "d-runner",
    connections: {
      inputs: [{ name: "Reverse Proxy", id: "d-mod-proxy-core" }],
      outputs: [{ name: "Docker Manager", id: "d-mod-docker" }],
    },
    dependencies: {
      external: ["gin-gonic/gin", "swaggo/swag"],
      internal: [],
    },
  },
  {
    id: "d-mod-runner-storage",
    label: "Storage Client",
    type: "data",
    description: "MinIO/S3 client for sandbox backup and restore operations. Handles uploading sandbox state to object storage and restoring from backups.",
    stats: "apps/runner/pkg/storage/ • client.go + minio_client.go",
    level: "module",
    group: "d-runner",
    connections: {
      inputs: [{ name: "Sandbox Executor", id: "d-mod-executor" }],
      outputs: [],
    },
    dependencies: {
      external: ["minio/minio-go"],
      internal: [],
    },
  },

  // ===== DAEMON GROUP =====
  {
    id: "d-mod-toolbox-fs",
    label: "Filesystem API",
    type: "component",
    description: "REST endpoints for sandbox filesystem operations: list files, create/delete/move files and folders, upload/download single and multiple files, search files, find in files, replace in files, set permissions.",
    stats: "apps/daemon/pkg/toolbox/fs/ • 14 Go files",
    level: "module",
    group: "d-daemon",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: ["gin-gonic/gin"],
      internal: [],
    },
  },
  {
    id: "d-mod-toolbox-git",
    label: "Git API",
    type: "component",
    description: "REST endpoints for git operations inside sandboxes: clone repository, checkout, create/delete/list branches, add, commit, pull, push, log history. Uses go-git library.",
    stats: "apps/daemon/pkg/toolbox/git/ + apps/daemon/pkg/git/ • ~20 Go files",
    level: "module",
    group: "d-daemon",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: ["go-git/go-git/v5"],
      internal: [],
    },
  },
  {
    id: "d-mod-toolbox-process",
    label: "Process Execution",
    type: "utility",
    description: "Code execution APIs: direct command execution, PTY sessions (WebSocket), REPL interpreter sessions (WebSocket), and persistent shell sessions. Supports running AI-generated code safely.",
    stats: "apps/daemon/pkg/toolbox/process/ • exec, pty/, interpreter/, session/",
    level: "module",
    group: "d-daemon",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: ["creack/pty", "gorilla/websocket"],
      internal: [],
    },
  },
  {
    id: "d-mod-toolbox-lsp",
    label: "LSP Server",
    type: "utility",
    description: "Language Server Protocol integration. Starts and manages LSP servers for Python and TypeScript inside the sandbox. Provides code intelligence APIs for completions, diagnostics, and navigation.",
    stats: "apps/daemon/pkg/toolbox/lsp/ • 7 Go files",
    level: "module",
    group: "d-daemon",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: [],
      internal: [],
    },
  },
  {
    id: "d-mod-daemon-ssh",
    label: "SSH Server",
    type: "api",
    description: "Embedded SSH server inside the daemon. Handles SSH connections forwarded by the SSH Gateway, provides terminal access and Unix socket forwarding.",
    stats: "apps/daemon/pkg/ssh/ • server.go + unix_forward.go + config/",
    level: "module",
    group: "d-daemon",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: ["gliderlabs/ssh", "golang.org/x/crypto"],
      internal: [],
    },
  },
  {
    id: "d-mod-computer-use",
    label: "Computer Use",
    type: "utility",
    description: "Computer use automation support inside sandboxes. RPC-based interface allowing AI agents to interact with desktop environments, take screenshots, and perform mouse/keyboard actions.",
    stats: "apps/daemon/pkg/toolbox/computeruse/ + libs/computer-use/",
    level: "module",
    group: "d-daemon",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: [],
      internal: ["libs/computer-use"],
    },
  },
  {
    id: "d-mod-toolbox-port",
    label: "Port Detection",
    type: "utility",
    description: "Automatic port detection and forwarding inside sandboxes. Monitors for new listening ports, enables preview URLs, and manages port mappings between sandbox and host.",
    stats: "apps/daemon/pkg/toolbox/port/ • 4 Go files",
    level: "module",
    group: "d-daemon",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: ["gin-gonic/gin"],
      internal: [],
    },
  },

  // ===== CLI GROUP =====
  {
    id: "d-mod-cli-sandbox",
    label: "Sandbox Commands",
    type: "api",
    description: "CLI commands for sandbox lifecycle: create, list, info, start, stop, archive, delete, exec (run command), ssh (terminal access), and preview-url. Includes interactive TUI views.",
    stats: "apps/cli/cmd/sandbox/ • 11 Go files",
    level: "module",
    group: "d-cli",
    connections: {
      inputs: [],
      outputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
    },
    dependencies: {
      external: ["spf13/cobra"],
      internal: ["libs/api-client-go"],
    },
  },
  {
    id: "d-mod-cli-snapshot",
    label: "Snapshot Commands",
    type: "api",
    description: "CLI commands for snapshot management: create snapshot from sandbox, list snapshots, push snapshot to registry, delete snapshot.",
    stats: "apps/cli/cmd/snapshot/ • 5 Go files",
    level: "module",
    group: "d-cli",
    connections: {
      inputs: [],
      outputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
    },
    dependencies: {
      external: ["spf13/cobra"],
      internal: ["libs/api-client-go"],
    },
  },
  {
    id: "d-mod-cli-mcp",
    label: "MCP Server",
    type: "utility",
    description: "Model Context Protocol server implementation for AI agent integration. Supports Claude, Cursor, and Windsurf agents. Provides MCP tools for sandbox operations.",
    stats: "apps/cli/cmd/mcp/ + apps/cli/mcp/ • 8 Go files",
    level: "module",
    group: "d-cli",
    connections: {
      inputs: [],
      outputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
    },
    dependencies: {
      external: ["spf13/cobra"],
      internal: [],
    },
  },
  {
    id: "d-mod-cli-common",
    label: "CLI Common",
    type: "config",
    description: "Shared CLI infrastructure: API client wrapper, auth/login/logout, config management, organization selection, SSH helpers, TUI views (Bubble Tea), output formatting.",
    stats: "apps/cli/cmd/common/ + apps/cli/auth/ + apps/cli/views/",
    level: "module",
    group: "d-cli",
    connections: {
      inputs: [
        { name: "Sandbox Commands", id: "d-mod-cli-sandbox" },
        { name: "Snapshot Commands", id: "d-mod-cli-snapshot" },
      ],
      outputs: [],
    },
    dependencies: {
      external: ["charmbracelet/bubbletea", "charmbracelet/lipgloss"],
      internal: ["libs/api-client-go"],
    },
  },
  {
    id: "d-mod-cli-auth",
    label: "Auth Commands",
    type: "api",
    description: "CLI commands for authentication: OIDC login via browser redirect, logout, token management, and API key configuration.",
    stats: "apps/cli/cmd/auth/ • 4 Go files",
    level: "module",
    group: "d-cli",
    connections: {
      inputs: [],
      outputs: [{ name: "Auth Module", id: "d-mod-auth" }],
    },
    dependencies: {
      external: ["spf13/cobra"],
      internal: ["libs/api-client-go"],
    },
  },
  {
    id: "d-mod-cli-volume",
    label: "Volume Commands",
    type: "api",
    description: "CLI commands for volume management: create, list, info, delete, and attach/detach volumes to sandboxes.",
    stats: "apps/cli/cmd/volume/ • 4 Go files",
    level: "module",
    group: "d-cli",
    connections: {
      inputs: [],
      outputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
    },
    dependencies: {
      external: ["spf13/cobra"],
      internal: ["libs/api-client-go"],
    },
  },
  {
    id: "d-mod-cli-org",
    label: "Organization Commands",
    type: "api",
    description: "CLI commands for organization management: list organizations, switch active org, manage members, and view organization settings.",
    stats: "apps/cli/cmd/organization/ • 5 Go files",
    level: "module",
    group: "d-cli",
    connections: {
      inputs: [],
      outputs: [{ name: "Organization Module", id: "d-mod-organization" }],
    },
    dependencies: {
      external: ["spf13/cobra"],
      internal: ["libs/api-client-go"],
    },
  },

  // ===== PROXY/GATEWAY GROUP =====
  {
    id: "d-mod-proxy-core",
    label: "Reverse Proxy Core",
    type: "api",
    description: "HTTP reverse proxy with target resolution for sandboxes and snapshots. Routes requests based on subdomain to the correct runner endpoint. Handles OAuth callbacks for web preview access.",
    stats: "apps/proxy/pkg/proxy/ • 7 Go files",
    level: "module",
    group: "d-gateway",
    connections: {
      inputs: [],
      outputs: [{ name: "Runner API", id: "d-mod-runner-api" }],
    },
    dependencies: {
      external: ["net/http/httputil"],
      internal: [],
    },
  },
  {
    id: "d-mod-snapshot-mgr",
    label: "Snapshot Manager",
    type: "utility",
    description: "Go service managing OCI image snapshot lifecycle. Handles snapshot creation scheduling, image building, registry push/pull coordination. Separate from the main API server.",
    stats: "apps/snapshot-manager/ • 6 Go files",
    level: "module",
    group: "d-infra",
    connections: {
      inputs: [{ name: "Sandbox Executor", id: "d-mod-executor" }],
      outputs: [{ name: "Docker Registry", id: "d-infra-registry" }],
    },
    dependencies: {
      external: [],
      internal: [],
    },
  },

  // ===== SDKs GROUP =====
  {
    id: "d-mod-sdk-python",
    label: "Python SDK",
    type: "component",
    description: "Python SDK providing high-level Daytona client class, sandbox creation with CreateSandboxBaseParams, code execution, file operations, and git management. Published to PyPI as 'daytona'.",
    stats: "libs/sdk-python/ • ~59 Python files",
    level: "module",
    group: "d-sdks",
    connections: {
      inputs: [],
      outputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
    },
    dependencies: {
      external: ["httpx", "pydantic"],
      internal: ["libs/api-client-python"],
    },
  },
  {
    id: "d-mod-sdk-typescript",
    label: "TypeScript SDK",
    type: "component",
    description: "TypeScript SDK with Daytona class, sandbox lifecycle management, and code execution. Published to npm as '@daytonaio/sdk'.",
    stats: "libs/sdk-typescript/ • ~30 TS files",
    level: "module",
    group: "d-sdks",
    connections: {
      inputs: [],
      outputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
    },
    dependencies: {
      external: ["axios"],
      internal: ["libs/api-client"],
    },
  },
  {
    id: "d-mod-sdk-go",
    label: "Go SDK",
    type: "component",
    description: "Go SDK with Daytona client, sandbox creation, and code execution. Uses the generated Go API client under the hood.",
    stats: "libs/sdk-go/ • ~25 Go files",
    level: "module",
    group: "d-sdks",
    connections: {
      inputs: [],
      outputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
    },
    dependencies: {
      external: [],
      internal: ["libs/api-client-go"],
    },
  },
  {
    id: "d-mod-sdk-ruby",
    label: "Ruby SDK",
    type: "component",
    description: "Ruby SDK wrapping the generated OpenAPI client. Provides Ruby-idiomatic interface for sandbox creation, code execution, and file operations.",
    stats: "libs/sdk-ruby/ • ~15 Ruby files",
    level: "module",
    group: "d-sdks",
    connections: {
      inputs: [],
      outputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
    },
    dependencies: {
      external: [],
      internal: ["libs/api-client-ruby"],
    },
  },
  {
    id: "d-mod-api-clients",
    label: "Generated API Clients",
    type: "config",
    description: "Auto-generated OpenAPI clients in TypeScript, Go, Python, and Ruby. Also includes Toolbox API clients for in-sandbox operations. Generated from the API server's OpenAPI spec.",
    stats: "libs/api-client* + libs/toolbox-api-client* + libs/runner-api-client",
    level: "module",
    group: "d-sdks",
    connections: {
      inputs: [
        { name: "Python SDK", id: "d-mod-sdk-python" },
        { name: "TypeScript SDK", id: "d-mod-sdk-typescript" },
        { name: "Go SDK", id: "d-mod-sdk-go" },
        { name: "Ruby SDK", id: "d-mod-sdk-ruby" },
      ],
      outputs: [],
    },
    dependencies: {
      external: [],
      internal: [],
    },
  },

  // ===== INFRASTRUCTURE GROUP =====
  {
    id: "d-infra-postgresql",
    label: "PostgreSQL",
    type: "data",
    description: "Primary state store for all application data: sandboxes, runners, snapshots, volumes, organizations, users, API keys, jobs, regions, audit logs. Accessed via TypeORM from the NestJS API.",
    stats: "Metadata store • TypeORM backend",
    level: "module",
    group: "d-infra",
    connections: {
      inputs: [{ name: "Sandbox Module", id: "d-mod-sandbox" }],
      outputs: [],
    },
    dependencies: { external: [], internal: [] },
  },
  {
    id: "d-infra-redis",
    label: "Redis",
    type: "data",
    description: "Multi-purpose in-memory store: API rate limiting (throttler), TypeORM query cache, sandbox lookup cache, distributed locks for concurrent operations.",
    stats: "Cache & rate limiter • Two Redis databases",
    level: "module",
    group: "d-infra",
    connections: {
      inputs: [{ name: "API Common", id: "d-mod-api-common" }],
      outputs: [],
    },
    dependencies: { external: [], internal: [] },
  },
  {
    id: "d-infra-dex",
    label: "Dex OIDC",
    type: "data",
    description: "Dex identity provider handling OIDC authentication. Supports SSO with Google, GitHub, and other providers. The API server validates JWT tokens issued by Dex.",
    stats: "Identity provider • OIDC / OAuth2",
    level: "module",
    group: "d-infra",
    connections: {
      inputs: [{ name: "Auth Module", id: "d-mod-auth" }],
      outputs: [],
    },
    dependencies: { external: [], internal: [] },
  },
  {
    id: "d-infra-docker",
    label: "Docker Engine",
    type: "data",
    description: "Container runtime on runner hosts. Creates and manages sandbox containers from OCI images. The runner communicates via the Docker SDK (unix socket or TCP).",
    stats: "Container runtime • OCI-compatible",
    level: "module",
    group: "d-infra",
    connections: {
      inputs: [{ name: "Docker Manager", id: "d-mod-docker" }],
      outputs: [],
    },
    dependencies: { external: [], internal: [] },
  },
  {
    id: "d-infra-s3",
    label: "Object Storage (S3/MinIO)",
    type: "data",
    description: "S3-compatible object storage for sandbox backups, snapshot artifacts, and file uploads. MinIO for self-hosted deployments, S3/GCS for cloud.",
    stats: "Backup & artifact store • S3-compatible",
    level: "module",
    group: "d-infra",
    connections: {
      inputs: [{ name: "Storage Client", id: "d-mod-runner-storage" }],
      outputs: [],
    },
    dependencies: { external: [], internal: [] },
  },
  {
    id: "d-infra-registry",
    label: "Docker Registry",
    type: "data",
    description: "Private Docker registry (registry:2.8.2) for storing and serving sandbox snapshot images. Used by runners to push snapshot builds and pull cached images for fast sandbox creation.",
    stats: "registry:2.8.2 • OCI distribution",
    level: "module",
    group: "d-infra",
    connections: {
      inputs: [
        { name: "Snapshot Manager", id: "d-mod-snapshot-mgr" },
        { name: "Docker Manager", id: "d-mod-docker" },
      ],
      outputs: [],
    },
    dependencies: { external: [], internal: [] },
  },
];

export const daytonaModuleEdges: GraphEdge[] = [
  // Dashboard → API
  { id: "d-me-pages-components", source: "d-mod-dashboard-pages", target: "d-mod-dashboard-components", type: "import", label: "UI components" },
  { id: "d-me-pages-api-layer", source: "d-mod-dashboard-pages", target: "d-mod-dashboard-api", type: "import", label: "Data fetching" },
  { id: "d-me-api-layer-sandbox", source: "d-mod-dashboard-api", target: "d-mod-sandbox", type: "call", label: "REST API calls" },

  // API internal
  { id: "d-me-sandbox-runner", source: "d-mod-sandbox", target: "d-mod-runner-mgmt", type: "call", label: "Assign runner" },
  { id: "d-me-sandbox-jobs", source: "d-mod-sandbox", target: "d-mod-jobs", type: "call", label: "Create jobs" },
  { id: "d-me-sandbox-webhook", source: "d-mod-sandbox", target: "d-mod-webhook", type: "data", label: "State change events" },
  { id: "d-me-sandbox-usage", source: "d-mod-sandbox", target: "d-mod-usage", type: "data", label: "Usage tracking" },
  { id: "d-me-auth-org", source: "d-mod-auth", target: "d-mod-organization", type: "call", label: "Validate membership" },
  { id: "d-me-org-region", source: "d-mod-organization", target: "d-mod-region", type: "call", label: "Region quotas" },

  // API → PostgreSQL
  { id: "d-me-sandbox-pg", source: "d-mod-sandbox", target: "d-infra-postgresql", type: "data", label: "TypeORM entities" },
  { id: "d-me-org-pg", source: "d-mod-organization", target: "d-infra-postgresql", type: "data", label: "Organization data" },

  // API → Redis
  { id: "d-me-common-redis", source: "d-mod-api-common", target: "d-infra-redis", type: "call", label: "Rate limiting & cache" },

  // Auth → Dex
  { id: "d-me-auth-dex", source: "d-mod-auth", target: "d-infra-dex", type: "call", label: "OIDC validation" },

  // Runner flow
  { id: "d-me-poller-executor", source: "d-mod-poller", target: "d-mod-executor", type: "call", label: "Dispatch jobs" },
  { id: "d-me-poller-api", source: "d-mod-poller", target: "d-mod-runner-mgmt", type: "call", label: "Poll for jobs" },
  { id: "d-me-executor-docker", source: "d-mod-executor", target: "d-mod-docker", type: "call", label: "Container ops" },
  { id: "d-me-executor-netrules", source: "d-mod-executor", target: "d-mod-netrules", type: "call", label: "Network policies" },
  { id: "d-me-executor-storage", source: "d-mod-executor", target: "d-mod-runner-storage", type: "call", label: "Backup/restore" },
  { id: "d-me-docker-infra", source: "d-mod-docker", target: "d-infra-docker", type: "call", label: "Docker SDK" },
  { id: "d-me-storage-s3", source: "d-mod-runner-storage", target: "d-infra-s3", type: "data", label: "S3 operations" },
  { id: "d-me-proxy-runner-api", source: "d-mod-proxy-core", target: "d-mod-runner-api", type: "call", label: "Route to sandbox" },
  { id: "d-me-runner-api-docker", source: "d-mod-runner-api", target: "d-mod-docker", type: "call", label: "Sandbox info" },

  // CLI → API
  { id: "d-me-cli-sandbox-api", source: "d-mod-cli-sandbox", target: "d-mod-sandbox", type: "call", label: "API requests" },
  { id: "d-me-cli-snapshot-api", source: "d-mod-cli-snapshot", target: "d-mod-sandbox", type: "call", label: "Snapshot API" },
  { id: "d-me-cli-sandbox-common", source: "d-mod-cli-sandbox", target: "d-mod-cli-common", type: "import", label: "Shared utilities" },
  { id: "d-me-cli-snapshot-common", source: "d-mod-cli-snapshot", target: "d-mod-cli-common", type: "import", label: "Shared utilities" },
  { id: "d-me-cli-mcp-api", source: "d-mod-cli-mcp", target: "d-mod-sandbox", type: "call", label: "MCP tool calls" },

  // SDKs → API clients → API
  { id: "d-me-sdk-python-clients", source: "d-mod-sdk-python", target: "d-mod-api-clients", type: "import", label: "Generated client" },
  { id: "d-me-sdk-ts-clients", source: "d-mod-sdk-typescript", target: "d-mod-api-clients", type: "import", label: "Generated client" },
  { id: "d-me-sdk-go-clients", source: "d-mod-sdk-go", target: "d-mod-api-clients", type: "import", label: "Generated client" },
  { id: "d-me-sdk-ruby-clients", source: "d-mod-sdk-ruby", target: "d-mod-api-clients", type: "import", label: "Generated client" },

  // Runner/Executor → Daemon modules (BLOCKER-1 fix: connect daemon modules)
  { id: "d-me-executor-fs", source: "d-mod-executor", target: "d-mod-toolbox-fs", type: "call", label: "Filesystem operations" },
  { id: "d-me-executor-git", source: "d-mod-executor", target: "d-mod-toolbox-git", type: "call", label: "Git operations" },
  { id: "d-me-executor-process", source: "d-mod-executor", target: "d-mod-toolbox-process", type: "call", label: "Process execution" },
  { id: "d-me-executor-lsp", source: "d-mod-executor", target: "d-mod-toolbox-lsp", type: "call", label: "LSP operations" },
  { id: "d-me-ssh-process", source: "d-mod-daemon-ssh", target: "d-mod-toolbox-process", type: "call", label: "SSH → PTY" },
  { id: "d-me-sdk-python-fs", source: "d-mod-sdk-python", target: "d-mod-toolbox-fs", type: "call", label: "File operations via Toolbox" },
  { id: "d-me-sdk-python-process", source: "d-mod-sdk-python", target: "d-mod-toolbox-process", type: "call", label: "Code execution via Toolbox" },

  // Snapshot Manager (BLOCKER-2 fix: connect snapshot-mgr)
  { id: "d-me-executor-snapshot-mgr", source: "d-mod-executor", target: "d-mod-snapshot-mgr", type: "call", label: "Trigger snapshot build" },
  { id: "d-me-snapshot-mgr-registry", source: "d-mod-snapshot-mgr", target: "d-infra-registry", type: "call", label: "Registry operations" },

  // New API module edges
  { id: "d-me-sandbox-audit", source: "d-mod-sandbox", target: "d-mod-audit", type: "data", label: "Audit events" },
  { id: "d-me-auth-user", source: "d-mod-auth", target: "d-mod-user", type: "call", label: "User lookup" },
  { id: "d-me-org-user", source: "d-mod-organization", target: "d-mod-user", type: "call", label: "Member management" },
  { id: "d-me-sandbox-notification", source: "d-mod-sandbox", target: "d-mod-notification", type: "data", label: "State notifications" },
  { id: "d-me-sandbox-docker-registry", source: "d-mod-sandbox", target: "d-mod-docker-registry", type: "call", label: "Image registry config" },
  { id: "d-me-user-pg", source: "d-mod-user", target: "d-infra-postgresql", type: "data", label: "User data" },
  { id: "d-me-audit-pg", source: "d-mod-audit", target: "d-infra-postgresql", type: "data", label: "Audit logs" },

  // New CLI module edges
  { id: "d-me-cli-auth-api", source: "d-mod-cli-auth", target: "d-mod-auth", type: "call", label: "OIDC login" },
  { id: "d-me-cli-auth-common", source: "d-mod-cli-auth", target: "d-mod-cli-common", type: "import", label: "Shared utilities" },
  { id: "d-me-cli-volume-api", source: "d-mod-cli-volume", target: "d-mod-sandbox", type: "call", label: "Volume API" },
  { id: "d-me-cli-volume-common", source: "d-mod-cli-volume", target: "d-mod-cli-common", type: "import", label: "Shared utilities" },
  { id: "d-me-cli-org-api", source: "d-mod-cli-org", target: "d-mod-organization", type: "call", label: "Org API" },
  { id: "d-me-cli-org-common", source: "d-mod-cli-org", target: "d-mod-cli-common", type: "import", label: "Shared utilities" },

  // Daemon port detection
  { id: "d-me-executor-port", source: "d-mod-executor", target: "d-mod-toolbox-port", type: "call", label: "Port forwarding" },
];

// ============================================================
// L4 — FILE / DIRECTORY LEVEL
// ============================================================

export const daytonaFileNodes: GraphNode[] = [
  // ===== d-mod-sandbox (~130 files) — apps/api/src/sandbox/ =====
  { id: "d-dir-sandbox-controllers", label: "controllers/", type: "api", description: "apps/api/src/sandbox/controllers/", stats: "8 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-services", label: "services/", type: "api", description: "apps/api/src/sandbox/services/", stats: "10 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-entities", label: "entities/", type: "api", description: "apps/api/src/sandbox/entities/", stats: "10 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-dto", label: "dto/", type: "api", description: "apps/api/src/sandbox/dto/", stats: "30 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-events", label: "events/", type: "api", description: "apps/api/src/sandbox/events/", stats: "17 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-enums", label: "enums/", type: "api", description: "apps/api/src/sandbox/enums/", stats: "10 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-managers", label: "managers/", type: "api", description: "apps/api/src/sandbox/managers/", stats: "7 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-guards", label: "guards/", type: "api", description: "apps/api/src/sandbox/guards/", stats: "5 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-subscribers", label: "subscribers/", type: "api", description: "apps/api/src/sandbox/subscribers/", stats: "4 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-runner-adapter", label: "runner-adapter/", type: "api", description: "apps/api/src/sandbox/runner-adapter/", stats: "3 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-utils", label: "utils/", type: "api", description: "apps/api/src/sandbox/utils/", stats: "5 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-constants", label: "constants/", type: "api", description: "apps/api/src/sandbox/constants/", stats: "6 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-repositories", label: "repositories/", type: "api", description: "apps/api/src/sandbox/repositories/ — TypeORM repository classes for sandbox, job, volume, snapshot, and runner entities", stats: "6 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },
  { id: "d-dir-sandbox-root", label: "(root files)", type: "api", description: "apps/api/src/sandbox/ — includes common/, errors/, proxy/ subdirectories", stats: "3 source files", level: "file", group: "d-api", parentId: "d-mod-sandbox" },

  // ===== d-mod-organization (~60 files) — apps/api/src/organization/ =====
  { id: "d-dir-org-dto", label: "dto/", type: "api", description: "apps/api/src/organization/dto/", stats: "22 source files", level: "file", group: "d-api", parentId: "d-mod-organization" },
  { id: "d-dir-org-controllers", label: "controllers/", type: "api", description: "apps/api/src/organization/controllers/", stats: "5 source files", level: "file", group: "d-api", parentId: "d-mod-organization" },
  { id: "d-dir-org-services", label: "services/", type: "api", description: "apps/api/src/organization/services/", stats: "5 source files", level: "file", group: "d-api", parentId: "d-mod-organization" },
  { id: "d-dir-org-entities", label: "entities/", type: "api", description: "apps/api/src/organization/entities/", stats: "5 source files", level: "file", group: "d-api", parentId: "d-mod-organization" },
  { id: "d-dir-org-events", label: "events/", type: "api", description: "apps/api/src/organization/events/", stats: "5 source files", level: "file", group: "d-api", parentId: "d-mod-organization" },
  { id: "d-dir-org-guards", label: "guards/", type: "api", description: "apps/api/src/organization/guards/", stats: "3 source files", level: "file", group: "d-api", parentId: "d-mod-organization" },
  { id: "d-dir-org-small", label: "(small dirs)", type: "api", description: "constants, decorators, enums, exceptions, helpers", stats: "10 source files", level: "file", group: "d-api", parentId: "d-mod-organization" },

  // ===== d-mod-dashboard-pages (24 files) =====
  { id: "d-dir-dash-sandboxes", label: "Sandboxes.tsx", type: "component", description: "apps/dashboard/src/pages/Sandboxes.tsx", stats: "", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-pages" },
  { id: "d-dir-dash-snapshots", label: "Snapshots.tsx", type: "component", description: "apps/dashboard/src/pages/Snapshots.tsx", stats: "", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-pages" },
  { id: "d-dir-dash-volumes", label: "Volumes.tsx", type: "component", description: "apps/dashboard/src/pages/Volumes.tsx", stats: "", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-pages" },
  { id: "d-dir-dash-runners", label: "Runners.tsx", type: "component", description: "apps/dashboard/src/pages/Runners.tsx", stats: "", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-pages" },
  { id: "d-dir-dash-regions", label: "Regions.tsx", type: "component", description: "apps/dashboard/src/pages/Regions.tsx", stats: "", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-pages" },
  { id: "d-dir-dash-keys", label: "Keys.tsx", type: "component", description: "apps/dashboard/src/pages/Keys.tsx", stats: "", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-pages" },
  { id: "d-dir-dash-audit", label: "AuditLogs.tsx", type: "component", description: "apps/dashboard/src/pages/AuditLogs.tsx", stats: "", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-pages" },
  { id: "d-dir-dash-org-members", label: "OrganizationMembers.tsx", type: "component", description: "apps/dashboard/src/pages/OrganizationMembers.tsx", stats: "", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-pages" },
  { id: "d-dir-dash-spending", label: "Spending.tsx", type: "component", description: "apps/dashboard/src/pages/Spending.tsx", stats: "", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-pages" },
  { id: "d-dir-dash-other", label: "(15 other pages)", type: "component", description: "Dashboard, AccountSettings, Callback, EmailVerify, LandingPage, Limits, LinkedAccounts, Logout, NotFound, Onboarding, OrganizationRoles, OrganizationSettings, Registries, UserOrganizationInvitations, Wallet", stats: "15 source files", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-pages" },

  // ===== d-mod-dashboard-components (~55 components) =====
  { id: "d-dir-dash-sandbox-table", label: "SandboxTable/", type: "component", description: "apps/dashboard/src/components/SandboxTable/", stats: "Table + detail sheet", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-components" },
  { id: "d-dir-dash-runner-table", label: "RunnerTable.tsx", type: "component", description: "apps/dashboard/src/components/RunnerTable.tsx + RunnerDetailsSheet.tsx", stats: "2 source files", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-components" },
  { id: "d-dir-dash-snapshot-table", label: "SnapshotTable.tsx", type: "component", description: "apps/dashboard/src/components/SnapshotTable.tsx", stats: "", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-components" },
  { id: "d-dir-dash-ui", label: "ui/", type: "component", description: "apps/dashboard/src/components/ui/ (shadcn-ui primitives)", stats: "~20 components", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-components" },
  { id: "d-dir-dash-other-components", label: "(40+ other components)", type: "component", description: "ApiKeyTable, AuditLogTable, RegionTable, RegistryTable, VolumeTable, Sidebar, CommandPalette, CreateDialogs, etc.", stats: "~40 source files", level: "file", group: "d-dashboard", parentId: "d-mod-dashboard-components" },

  // ===== d-mod-docker (~25 files) — apps/runner/pkg/docker/ =====
  { id: "d-dir-docker-create", label: "create.go", type: "utility", description: "apps/runner/pkg/docker/create.go", stats: "", level: "file", group: "d-runner", parentId: "d-mod-docker" },
  { id: "d-dir-docker-start", label: "start.go", type: "utility", description: "apps/runner/pkg/docker/start.go", stats: "", level: "file", group: "d-runner", parentId: "d-mod-docker" },
  { id: "d-dir-docker-stop", label: "stop.go", type: "utility", description: "apps/runner/pkg/docker/stop.go", stats: "", level: "file", group: "d-runner", parentId: "d-mod-docker" },
  { id: "d-dir-docker-destroy", label: "destroy.go", type: "utility", description: "apps/runner/pkg/docker/destroy.go", stats: "", level: "file", group: "d-runner", parentId: "d-mod-docker" },
  { id: "d-dir-docker-image", label: "(image ops)", type: "utility", description: "image_build.go, image_pull.go, image_push.go, image_exists.go, image_info.go, image_remove.go, tag_image.go", stats: "7 source files", level: "file", group: "d-runner", parentId: "d-mod-docker" },
  { id: "d-dir-docker-snapshot", label: "(snapshot ops)", type: "utility", description: "snapshot_build.go, snapshot_pull.go, container_commit.go", stats: "3 source files", level: "file", group: "d-runner", parentId: "d-mod-docker" },
  { id: "d-dir-docker-infra", label: "(infra)", type: "utility", description: "client.go, daemon.go, daemon_version.go, network.go, volumes_cleanup.go, volumes_mountpaths.go, state.go, monitor.go, resize.go, recover.go, backup.go", stats: "11 source files", level: "file", group: "d-runner", parentId: "d-mod-docker" },

  // ===== d-mod-executor (4 files) =====
  { id: "d-dir-executor-main", label: "executor.go", type: "utility", description: "apps/runner/pkg/runner/v2/executor/executor.go", stats: "", level: "file", group: "d-runner", parentId: "d-mod-executor" },
  { id: "d-dir-executor-sandbox", label: "sandbox.go", type: "utility", description: "apps/runner/pkg/runner/v2/executor/sandbox.go", stats: "", level: "file", group: "d-runner", parentId: "d-mod-executor" },
  { id: "d-dir-executor-snapshot", label: "snapshot.go", type: "utility", description: "apps/runner/pkg/runner/v2/executor/snapshot.go", stats: "", level: "file", group: "d-runner", parentId: "d-mod-executor" },
  { id: "d-dir-executor-backup", label: "backup.go", type: "utility", description: "apps/runner/pkg/runner/v2/executor/backup.go", stats: "", level: "file", group: "d-runner", parentId: "d-mod-executor" },

  // ===== d-mod-toolbox-fs (14 files) =====
  { id: "d-dir-fs-list", label: "list_files.go", type: "component", description: "apps/daemon/pkg/toolbox/fs/list_files.go", stats: "", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-fs" },
  { id: "d-dir-fs-upload", label: "upload_file(s).go", type: "component", description: "apps/daemon/pkg/toolbox/fs/upload_file.go + upload_files.go", stats: "2 source files", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-fs" },
  { id: "d-dir-fs-download", label: "download_file(s).go", type: "component", description: "apps/daemon/pkg/toolbox/fs/download_file.go + download_files.go", stats: "2 source files", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-fs" },
  { id: "d-dir-fs-crud", label: "(CRUD ops)", type: "component", description: "create_folder.go, delete_file.go, move_file.go, get_file_info.go, set_file_permissions.go", stats: "5 source files", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-fs" },
  { id: "d-dir-fs-search", label: "(search ops)", type: "component", description: "search_files.go, find_in_files.go, replace_in_files.go, types.go", stats: "4 source files", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-fs" },

  // ===== d-mod-toolbox-git (~20 files) =====
  { id: "d-dir-git-toolbox", label: "toolbox/git/", type: "component", description: "apps/daemon/pkg/toolbox/git/ (REST handlers: clone, checkout, branch CRUD, add, commit, pull, push, status, history)", stats: "12 source files", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-git" },
  { id: "d-dir-git-service", label: "git/ (service)", type: "component", description: "apps/daemon/pkg/git/ (git service implementation: add, branch, checkout, clone, commit, config, log, pull, push, status, types)", stats: "12 source files", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-git" },

  // ===== d-mod-toolbox-process =====
  { id: "d-dir-process-exec", label: "execute.go", type: "utility", description: "apps/daemon/pkg/toolbox/process/execute.go", stats: "", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-process" },
  { id: "d-dir-process-pty", label: "pty/", type: "utility", description: "apps/daemon/pkg/toolbox/process/pty/ (PTY session management via WebSocket)", stats: "6 source files", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-process" },
  { id: "d-dir-process-interpreter", label: "interpreter/", type: "utility", description: "apps/daemon/pkg/toolbox/process/interpreter/ (REPL interpreter sessions via WebSocket)", stats: "5 source files", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-process" },
  { id: "d-dir-process-session", label: "session/", type: "utility", description: "apps/daemon/pkg/toolbox/process/session/ (persistent shell sessions)", stats: "6 source files", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-process" },

  // ===== d-mod-toolbox-lsp (7 files) =====
  { id: "d-dir-lsp-server", label: "server.go", type: "utility", description: "apps/daemon/pkg/toolbox/lsp/server.go", stats: "", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-lsp" },
  { id: "d-dir-lsp-client", label: "client.go", type: "utility", description: "apps/daemon/pkg/toolbox/lsp/client.go", stats: "", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-lsp" },
  { id: "d-dir-lsp-langs", label: "(language servers)", type: "utility", description: "python_lsp.go, typescript_lsp.go, lsp.go, service.go, types.go", stats: "5 source files", level: "file", group: "d-daemon", parentId: "d-mod-toolbox-lsp" },

  // ===== d-mod-cli-sandbox (11 files) =====
  { id: "d-dir-cli-sandbox-create", label: "create.go", type: "api", description: "apps/cli/cmd/sandbox/create.go", stats: "", level: "file", group: "d-cli", parentId: "d-mod-cli-sandbox" },
  { id: "d-dir-cli-sandbox-list", label: "list.go", type: "api", description: "apps/cli/cmd/sandbox/list.go", stats: "", level: "file", group: "d-cli", parentId: "d-mod-cli-sandbox" },
  { id: "d-dir-cli-sandbox-lifecycle", label: "(lifecycle)", type: "api", description: "start.go, stop.go, delete.go, archive.go, info.go", stats: "5 source files", level: "file", group: "d-cli", parentId: "d-mod-cli-sandbox" },
  { id: "d-dir-cli-sandbox-access", label: "(access)", type: "api", description: "exec.go, ssh.go, preview_url.go, sandbox.go", stats: "4 source files", level: "file", group: "d-cli", parentId: "d-mod-cli-sandbox" },

  // ===== d-mod-cli-mcp (8 files) =====
  { id: "d-dir-cli-mcp-start", label: "start.go", type: "utility", description: "apps/cli/cmd/mcp/start.go", stats: "", level: "file", group: "d-cli", parentId: "d-mod-cli-mcp" },
  { id: "d-dir-cli-mcp-init", label: "init.go", type: "utility", description: "apps/cli/cmd/mcp/init.go", stats: "", level: "file", group: "d-cli", parentId: "d-mod-cli-mcp" },
  { id: "d-dir-cli-mcp-agents", label: "agents/", type: "utility", description: "apps/cli/cmd/mcp/agents/ (claude.go, cursor.go, windsurf.go, common.go)", stats: "4 source files", level: "file", group: "d-cli", parentId: "d-mod-cli-mcp" },

  // ===== d-mod-proxy-core (7 files) =====
  { id: "d-dir-proxy-main", label: "proxy.go", type: "api", description: "apps/proxy/pkg/proxy/proxy.go", stats: "", level: "file", group: "d-gateway", parentId: "d-mod-proxy-core" },
  { id: "d-dir-proxy-auth", label: "auth.go", type: "api", description: "apps/proxy/pkg/proxy/auth.go + auth_callback.go", stats: "2 source files", level: "file", group: "d-gateway", parentId: "d-mod-proxy-core" },
  { id: "d-dir-proxy-targets", label: "(target resolvers)", type: "api", description: "get_sandbox_target.go, get_snapshot_target.go, get_sandbox_build_target.go, warning_page.go", stats: "4 source files", level: "file", group: "d-gateway", parentId: "d-mod-proxy-core" },

  // ===== d-mod-sdk-python =====
  { id: "d-dir-sdk-python-core", label: "src/daytona/", type: "component", description: "libs/sdk-python/src/daytona/ (Daytona client, sandbox, code execution)", stats: "~20 source files", level: "file", group: "d-sdks", parentId: "d-mod-sdk-python" },
  { id: "d-dir-sdk-python-tests", label: "tests/", type: "component", description: "libs/sdk-python/tests/", stats: "~15 source files", level: "file", group: "d-sdks", parentId: "d-mod-sdk-python" },

  // ===== d-mod-sdk-typescript =====
  { id: "d-dir-sdk-ts-src", label: "src/", type: "component", description: "libs/sdk-typescript/src/ (Daytona class, sandbox types)", stats: "~25 source files", level: "file", group: "d-sdks", parentId: "d-mod-sdk-typescript" },
];

export const daytonaFileEdges: GraphEdge[] = [];
