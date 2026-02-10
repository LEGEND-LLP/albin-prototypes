# Daytona Architecture Mapping — Demo Guide

This document is a reference for demoing Legend's Daytona visualization to the Daytona team. It covers what's mapped, what's intentionally omitted, and talking points for each zoom level.

---

## How to Run the Demo

```bash
npm run dev
# Open http://localhost:8080
# Select "Daytona" from the repo list
# Navigate to /graph/daytona
```

Use the zoom slider (bottom-left) to switch between the 4 levels: Context → System → Module → File.

---

## Coverage Summary

| Level | Real Components | Mapped | Coverage |
|-------|----------------|--------|----------|
| L1 Context | 1 system + 4 actors + 5 externals | 11 nodes | 100% |
| L2 System | 9 services + infra | 9 nodes | 100% |
| L3 Module | ~55 packages/modules | 49 nodes | ~90% of important ones |
| L4 File | Hundreds of files | 74 nodes | Key directories only |

**Total: 143 nodes, 75 edges across all levels.**

---

## L1 — Context Level

Everything mapped. Shows Daytona as a central system with three actor types and five external dependencies.

### Talking Points
- **Three user personas**: AI Developers (SDK users building agents), Platform Engineers (infra operators using the dashboard), SDK Users (integrating sandboxes into apps)
- **Five external systems**: Docker/OCI runtime, Git providers (GitHub/GitLab/Bitbucket), OCI registries, S3-compatible storage, and Dex OIDC identity provider
- This level answers: *"What does Daytona interact with?"*

---

## L2 — System / Container Level

All 9 services from `docker-compose.yaml` are represented, plus SDKs as a logical group.

| Service | Node | Color Group |
|---------|------|-------------|
| NestJS API Server | d-api-server | Blue (API) |
| React Dashboard | d-dashboard | Green (Component) |
| Runner Service (Go) | d-runner | Purple (Utility) |
| Daemon / Toolbox Agent (Go) | d-daemon | Orange (Config) |
| CLI (Go) | d-cli | Red (CLI) |
| Reverse Proxy (Go) | d-proxy | Rust (Gateway) |
| SSH Gateway (Go) | d-ssh-gateway | Rust (Gateway) |
| Multi-Language SDKs | d-sdks | Teal (External) |
| Infrastructure | d-infra | Gray (Data) |

### Key Edges to Highlight
- **Dashboard/CLI/SDKs → API**: All three client surfaces call the NestJS API
- **API → Runner**: Job dispatch — the API creates jobs, runners poll and execute them
- **Runner → Daemon**: The runner creates containers and communicates with the daemon inside via the Toolbox API
- **SDKs → Daemon**: SDKs also call the Toolbox API directly (via proxy) for file ops and code execution
- **Proxy → Runner**: Routes external web requests (preview URLs) to the correct sandbox

### Talking Points
- *"This is the C4 Container diagram — every box is a separately deployable unit"*
- The split between **API** (orchestration, state, auth) and **Runner** (execution, Docker) is the core architectural pattern
- The **Daemon** runs inside every sandbox container — it's the in-sandbox agent providing file/git/LSP/exec APIs
- SDKs talk to both the API (sandbox lifecycle) and the Daemon (code execution) — two separate communication paths

---

## L3 — Module / Component Level

This is the richest level. 49 module nodes organized into 8 groups.

### API Server Group (13 modules)

| Module | What It Does |
|--------|-------------|
| **Sandbox Module** | Core module — sandbox CRUD, lifecycle state machine, warm pools, job orchestration |
| **Organization Module** | Multi-tenancy — org CRUD, invitations, RBAC, quotas |
| **Auth Module** | OIDC (Dex) + API key auth, route guards |
| **Runner Management** | Runner registration, health monitoring, job assignment |
| **Job System** | Async job queue — create/start/stop/destroy/snapshot jobs |
| **Webhook & Events** | Event-driven webhook delivery for state changes |
| **Region Module** | Multi-region sandbox distribution |
| **API Common** | Shared infra — rate limiting, config, filters, metrics |
| **Usage & Analytics** | Compute time tracking, storage quotas, telemetry |
| **Docker Registry Module** | Container image registry configuration per org |
| **Audit Module** | Audit logging with PostgreSQL/OpenSearch/Kafka adapters |
| **User Module** | User accounts, roles, linked accounts, email verification |
| **Notification Module** | In-app notifications + email alerts |

**Not mapped (intentional):**
- `AdminModule` — internal admin endpoints, not architecturally interesting
- `EmailModule` — small service, functionality covered under Notification description
- `HealthModule` — single health check endpoint
- `ObjectStorageModule` — S3 config wrapper, minor

### Dashboard Group (3 modules)

| Module | What It Does |
|--------|-------------|
| **Dashboard Pages** | 24 React page components (9 shown individually, 15 grouped) |
| **Dashboard Components** | ~55 reusable components (tables, sheets, dialogs, shadcn-ui) |
| **Dashboard API Layer** | React Query hooks, services, auth/org context providers |

### Runner Group (6 modules)

| Module | What It Does |
|--------|-------------|
| **Sandbox Executor** | Processes sandbox jobs — create, start, stop, destroy, snapshot |
| **Job Poller** | Polls API server for pending jobs, dispatches to executor |
| **Docker Manager** | Docker SDK wrapper — container + image lifecycle, snapshots |
| **Network Rules** | iptables-style egress control per sandbox |
| **Runner API** | HTTP API for health, proxy, sandbox info (also embeds daemon binary, SSH gateway config) |
| **Storage Client** | MinIO/S3 client for backup/restore |

**Not mapped (intentional):**
- `pkg/cache`, `pkg/common`, `pkg/models`, `pkg/services`, `pkg/apiclient`, `pkg/sshgateway`, `pkg/daemon` — internal support packages, mentioned in Runner API description

### Daemon Group (7 modules)

| Module | What It Does |
|--------|-------------|
| **Filesystem API** | REST endpoints for file CRUD, upload/download, search, permissions |
| **Git API** | Clone, checkout, branch, commit, push, pull via go-git |
| **Process Execution** | Command exec, PTY sessions (WebSocket), REPL interpreter, persistent shells |
| **LSP Server** | Language Server Protocol — code intelligence for Python & TypeScript |
| **SSH Server** | Embedded SSH server for terminal access via SSH Gateway |
| **Computer Use** | RPC-based desktop automation for AI agents |
| **Port Detection** | Auto-detects listening ports, enables preview URLs |

**Not mapped (intentional):**
- `config/`, `docs/`, `middlewares/`, `proxy/` (toolbox-level) — internal plumbing
- `pkg/common`, `pkg/gitprovider`, `pkg/session`, `pkg/terminal` — small support packages

### CLI Group (7 modules)

| Module | What It Does |
|--------|-------------|
| **Sandbox Commands** | create, list, info, start, stop, archive, delete, exec, ssh, preview-url |
| **Snapshot Commands** | create, list, push, delete |
| **MCP Server** | Model Context Protocol server for Claude/Cursor/Windsurf integration |
| **CLI Common** | Shared infra — API client, auth, config, TUI views (Bubble Tea) |
| **Auth Commands** | OIDC login/logout via browser redirect |
| **Volume Commands** | Volume CRUD and attach/detach |
| **Organization Commands** | Org list, switch, create, delete, member management |

All 7 real CLI command groups are mapped.

### SDKs Group (5 modules)

| Module | What It Does |
|--------|-------------|
| **Python SDK** | Most mature — Daytona client, sandbox creation, code execution (PyPI) |
| **TypeScript SDK** | npm package `@daytonaio/sdk` |
| **Go SDK** | Go module wrapping generated client |
| **Ruby SDK** | Ruby gem wrapping generated client |
| **Generated API Clients** | Auto-generated from OpenAPI spec (TS, Go, Python, Ruby + Toolbox clients) |

### Gateway Group (1 module)

| Module | What It Does |
|--------|-------------|
| **Reverse Proxy Core** | Subdomain-based routing to sandbox containers, OAuth callback handling |

### Infrastructure Group (7 modules)

| Module | What It Does |
|--------|-------------|
| **PostgreSQL** | Primary state store via TypeORM — all entities |
| **Redis** | Rate limiting, query cache, distributed locks |
| **Dex OIDC** | Identity provider with SSO connectors |
| **Docker Engine** | Container runtime on runner hosts |
| **Object Storage (S3/MinIO)** | Sandbox backups and artifacts |
| **Docker Registry** | Private registry (registry:2.8.2) for snapshot images |
| **Snapshot Manager** | Separate Go service managing OCI snapshot lifecycle |

**Not mapped (intentional):**
- `pgadmin` — dev tool, not production architecture
- `registry-ui` — dev tool
- `maildev` — dev email server
- `jaeger` + `otel-collector` — observability stack (could add later)

### Key L3 Edges to Highlight
- **Executor → all Daemon modules**: Shows the runner directly driving filesystem, git, process, LSP, and port detection inside sandboxes
- **SDK Python → Toolbox FS/Process**: SDKs bypass the API for code execution, going directly to the Daemon's Toolbox API
- **Executor → Snapshot Manager → Docker Registry**: The snapshot build pipeline
- **Auth → User → PostgreSQL**: The authentication and identity chain

---

## L4 — File / Directory Level

74 file-level nodes showing directory structure for the most important modules. This level is best used by clicking on a specific L3 module node to see its internals.

### Highlights to Show
- **Sandbox module internals**: controllers/, services/, entities/, dto/ (30 files!), events/, enums/, managers/, guards/, subscribers/, runner-adapter/, repositories/, utils/, constants/
- **Docker manager**: Individual files for create, start, stop, destroy + grouped image ops and snapshot ops
- **Daemon toolbox**: Shows the fs/, git/, process/ (with pty/, interpreter/, session/ subdirs), lsp/ structure
- **Dashboard pages**: 9 individual pages + "(15 other pages)" grouped

### Not Mapped at L4
File-level edges (`daytonaFileEdges`) are intentionally empty — this matches our PostHog mapping pattern. File-level import relationships are too noisy to visualize effectively.

---

## Known Gaps & Honest Answers

If asked about gaps, here's what to say:

**"Where are the admin/health/email modules?"**
> We focused on the architecturally significant modules. Admin is internal tooling, Health is a single endpoint, Email is a small transport layer covered by the Notification module.

**"Where's the observability stack (Jaeger, OpenTelemetry)?"**
> We mapped the core application architecture, not the observability sidecar. It's infrastructure that could be added as a separate infrastructure node.

**"Why aren't file-level edges shown?"**
> File-level import graphs are extremely dense and noisy. We chose to show directory structure at L4, which gives a better overview of code organization than a hairball of import arrows.

**"The runner has more packages than shown"**
> Yes — packages like cache, models, apiclient, common, sshgateway are internal support packages. We rolled their description into the Runner API node to keep the diagram readable.

**"Is this generated automatically?"**
> This mapping was built through deep analysis of the actual codebase — directory structure, module boundaries, docker-compose services, and cross-service communication patterns. Legend automates the visualization; the architectural analysis is the intelligence layer on top.

---

## Repo Source

Mapped from: **github.com/daytonaio/daytona** (main branch, February 2026)

Data file: `src/data/demoDataDaytona.ts`
