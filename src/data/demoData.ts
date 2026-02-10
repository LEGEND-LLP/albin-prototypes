// PostHog mapping based on commit 890fda97 (2025-02-XX)
// https://github.com/PostHog/posthog
// PostHog codebase visualization — mapped by Legend

export interface Repository {
  id: string;
  name: string;
  owner: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  lastUpdated: string;
}

export const demoRepositories: Repository[] = [
  {
    id: "posthog",
    name: "posthog",
    owner: "PostHog",
    description: "Open-source product analytics, session recording, feature flagging and A/B testing",
    language: "Python",
    languageColor: "#3572A5",
    stars: 31200,
    lastUpdated: "1 hour ago",
  },
  {
    id: "daytona",
    name: "daytona",
    owner: "daytonaio",
    description: "Secure and elastic infrastructure for running AI-generated code",
    language: "TypeScript",
    languageColor: "#3178C6",
    stars: 54700,
    lastUpdated: "2 hours ago",
  },
];

export type NodeType = "component" | "api" | "utility" | "data" | "config" | "problem" | "actor" | "external";
export type ZoomLevel = "context" | "system" | "module" | "file";
export type SystemGroup = "web-app" | "frontend" | "plugin-server" | "workers" | "temporal" | "rust-services" | "infrastructure" | "livestream"
  | "d-api" | "d-dashboard" | "d-runner" | "d-daemon" | "d-cli" | "d-gateway" | "d-sdks" | "d-infra";

export interface TechnicalSpec {
  title: string;
  details: string;
}

export interface WorkflowStep {
  step: number;
  description: string;
}

export interface EdgeCase {
  scenario: string;
  handling: string;
  severity?: "info" | "warning" | "critical";
}

export interface SystemFlow {
  diagram: string;
}

export interface ComponentInteraction {
  component: string;
  role: string;
}

export interface DataFlow {
  inputs: string[];
  processing: string[];
  outputs: string[];
}

export interface LogicLocation {
  name: string;
  file: string;
  functionName?: string;
  steps: string[];
}

export interface ImplementationFile {
  path: string;
  purpose: string;
  exports?: {
    name: string;
    signature?: string;
    responsibility: string;
    calledBy?: string;
  }[];
  dependencies?: string[];
}

export interface TechnicalDecision {
  topic: string;
  decision: string;
  rationale: string[];
  tradeoffs?: {
    benefits: string[];
    drawbacks?: string[];
  };
}

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  description: string;
  stats: string;
  level: ZoomLevel;
  parentId?: string;
  group?: SystemGroup;
  hasProblem?: boolean;
  problemDescription?: string;
  functionalities?: {
    name: string;
    description: string;
    items?: string[];
  }[];
  technicalSpecs?: TechnicalSpec[];
  architecture?: string;
  keyDecisions?: string[];
  connections?: {
    inputs: { name: string; id: string }[];
    outputs: { name: string; id: string }[];
  };
  dependencies?: {
    external: string[];
    internal: string[];
  };
  purpose?: string;
  howItWorks?: {
    overview?: string;
    workflow?: WorkflowStep[];
    edgeCases?: EdgeCase[];
  };
  architectureDetails?: {
    overview?: string;
    systemFlow?: SystemFlow;
    componentInteractions?: ComponentInteraction[];
    dataFlow?: DataFlow;
  };
  logicLocations?: LogicLocation[];
  implementationFiles?: ImplementationFile[];
  technicalDecisions?: TechnicalDecision[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: "import" | "export" | "call" | "data";
  label?: string;
  isCircular?: boolean;
}

// ============================================================
// L1 — CONTEXT LEVEL
// ============================================================

export const contextNodes: GraphNode[] = [
  {
    id: "posthog-system",
    label: "PostHog",
    type: "component",
    description: "Open-source product analytics platform. Provides event ingestion, session recording, feature flags, A/B testing, and data warehouse queries.",
    stats: "Python 49% • TypeScript 41% • Rust 7%",
    level: "context",
    purpose: "PostHog is the all-in-one product analytics platform that replaces multiple SaaS tools (Amplitude, LaunchDarkly, Hotjar) with a single self-hostable system.",
  },
  // Actors
  {
    id: "actor-product-teams",
    label: "Product Teams",
    type: "actor",
    description: "Product managers and analysts who use PostHog dashboards to understand user behavior, run experiments, and make data-driven decisions.",
    stats: "Primary users",
    level: "context",
  },
  {
    id: "actor-developers",
    label: "Developers",
    type: "actor",
    description: "Engineers who integrate PostHog SDKs into their applications, configure feature flags, and set up event tracking.",
    stats: "SDK integrators",
    level: "context",
  },
  {
    id: "actor-end-users",
    label: "End Users",
    type: "actor",
    description: "Users of applications that have PostHog SDKs embedded. Their interactions generate events, session recordings, and feature flag evaluations.",
    stats: "Event sources",
    level: "context",
  },
  {
    id: "actor-data-engineers",
    label: "Data Engineers",
    type: "actor",
    description: "Configure warehouse exports, write HogQL queries, set up data pipelines and import connectors.",
    stats: "Pipeline builders",
    level: "context",
  },
  // External systems
  {
    id: "ext-client-apps",
    label: "Client Applications",
    type: "external",
    description: "Websites and mobile apps with PostHog SDKs. Generate events, session recordings, and feature flag evaluations.",
    stats: "SDK-instrumented apps",
    level: "context",
  },
  {
    id: "ext-llm-providers",
    label: "LLM Providers",
    type: "external",
    description: "OpenAI, Anthropic, Google Gemini, Mistral — power the Max AI assistant and LLM analytics.",
    stats: "AI backends",
    level: "context",
  },
  {
    id: "ext-identity",
    label: "Identity Providers",
    type: "external",
    description: "Google, GitHub, GitLab SSO via SAML/OAuth. Enterprise authentication.",
    stats: "SSO / SAML / OAuth",
    level: "context",
  },
  {
    id: "ext-warehouse-dest",
    label: "Data Warehouses",
    type: "external",
    description: "Customer-owned BigQuery, Snowflake, Redshift, Databricks — batch export destinations.",
    stats: "Export destinations",
    level: "context",
  },
  {
    id: "ext-data-sources",
    label: "Data Import Sources",
    type: "external",
    description: "Stripe, Salesforce, HubSpot, Shopify, ad platforms — 40+ import connectors.",
    stats: "40+ connectors",
    level: "context",
  },
  {
    id: "ext-stripe",
    label: "Stripe",
    type: "external",
    description: "Payment processing for PostHog Cloud billing.",
    stats: "Billing provider",
    level: "context",
  },
];

export const contextEdges: GraphEdge[] = [
  { id: "ctx-e1", source: "actor-product-teams", target: "posthog-system", type: "call", label: "Uses dashboards" },
  { id: "ctx-e2", source: "actor-developers", target: "posthog-system", type: "call", label: "Integrates SDKs" },
  { id: "ctx-e3", source: "actor-end-users", target: "posthog-system", type: "data", label: "Generates events" },
  { id: "ctx-e4", source: "actor-data-engineers", target: "posthog-system", type: "call", label: "Queries & pipelines" },
  { id: "ctx-e5", source: "ext-client-apps", target: "posthog-system", type: "data", label: "Events & recordings" },
  { id: "ctx-e6", source: "posthog-system", target: "ext-llm-providers", type: "call", label: "AI queries" },
  { id: "ctx-e7", source: "posthog-system", target: "ext-identity", type: "call", label: "SSO authentication" },
  { id: "ctx-e8", source: "posthog-system", target: "ext-warehouse-dest", type: "data", label: "Batch exports" },
  { id: "ctx-e9", source: "ext-data-sources", target: "posthog-system", type: "data", label: "Data imports" },
  { id: "ctx-e10", source: "posthog-system", target: "ext-stripe", type: "call", label: "Billing" },
  { id: "ctx-e11", source: "actor-developers", target: "ext-client-apps", type: "call", label: "Embed SDKs" },
];

// ============================================================
// L2 — SYSTEM / CONTAINER LEVEL
// ============================================================

export const systemNodes: GraphNode[] = [
  {
    id: "django-web",
    label: "Django Web App",
    type: "api",
    description: "Python/Django application serving the REST API and the React frontend. Handles authentication, project management, HogQL queries, and all CRUD operations. Served via Granian (ASGI server).",
    stats: "Python • Django 4.x • Granian ASGI • ~800 API endpoints",
    level: "system",
    architecture: "Django REST Framework with ViewSets. Serves the React SPA as a Django template. HogQL queries compiled server-side to ClickHouse SQL. Served via Granian (ASGI server).",
    technicalSpecs: [
      { title: "Framework", details: "Django 4.x with DRF, Channels for WebSocket" },
      { title: "Auth", details: "Session-based + API keys + SSO (SAML/OIDC)" },
      { title: "Query Engine", details: "HogQL — custom SQL dialect compiled to ClickHouse" },
    ],
    connections: {
      inputs: [
        { name: "React Frontend", id: "react-frontend" },
        { name: "Client SDKs", id: "rust-capture" },
      ],
      outputs: [
        { name: "Celery Workers", id: "celery-workers" },
        { name: "Node.js Event Engine", id: "nodejs-engine" },
        { name: "Temporal Workers", id: "temporal-workers" },
      ],
    },
    dependencies: {
      external: ["django", "djangorestframework", "celery", "clickhouse-driver"],
      internal: ["posthog/api", "posthog/models", "posthog/hogql"],
    },
  },
  {
    id: "react-frontend",
    label: "React Frontend",
    type: "component",
    description: "Single-page React/TypeScript application providing the PostHog dashboard UI. Includes insights builder, session replay viewer, feature flag management, and data exploration tools. In production, built as static assets served by the Django container.",
    stats: "TypeScript • React 18 • Kea state management",
    level: "system",
    architecture: "React SPA bundled by Webpack, served via Django. Uses Kea.js for state management with logic stores. PostHog's own JS SDK for dogfooding analytics.",
    technicalSpecs: [
      { title: "State", details: "Kea.js logic stores (Redux-based)" },
      { title: "Scenes", details: "~40 page-level scenes (dashboards, insights, flags, etc.)" },
      { title: "Queries", details: "HogQL editor with syntax highlighting + query runner" },
    ],
    connections: {
      inputs: [],
      outputs: [{ name: "Django Web App", id: "django-web" }],
    },
    dependencies: {
      external: ["react", "kea", "antd", "@monaco-editor/react"],
      internal: ["frontend/src/scenes", "frontend/src/queries"],
    },
  },
  {
    id: "nodejs-engine",
    label: "Node.js Event Engine",
    type: "utility",
    description: "Node.js/TypeScript service running the event ingestion pipeline, CDP transformations, session recording processing, log ingestion, and LLM analytics. Replaces the legacy 'plugin server'.",
    stats: "TypeScript • Node.js 24 • Kafka consumers",
    level: "system",
    architecture: "Multi-consumer Kafka pipeline. Each consumer reads from a topic, processes events, and writes to the next topic. Supports plugins and Hog-language transformations.",
    technicalSpecs: [
      { title: "Runtime", details: "Node.js with worker threads" },
      { title: "Pipeline", details: "Kafka consumer groups for parallel processing" },
      { title: "CDP", details: "User-configurable destinations (webhooks, Slack, etc.)" },
    ],
    connections: {
      inputs: [{ name: "Kafka", id: "infra-kafka" }],
      outputs: [
        { name: "ClickHouse", id: "infra-clickhouse" },
        { name: "Kafka", id: "infra-kafka" },
      ],
    },
    dependencies: {
      external: ["kafkajs", "node-rdkafka", "piscina"],
      internal: ["nodejs/src/cdp", "nodejs/src/ingestion", "nodejs/src/session-recording"],
    },
  },
  {
    id: "celery-workers",
    label: "Celery Workers",
    type: "config",
    description: "Python Celery workers handling async background tasks: batch exports to external warehouses, scheduled reports, cohort calculations, and data cleanup.",
    stats: "Python • Celery • Redis broker",
    level: "system",
    architecture: "Celery beat schedules periodic tasks. Workers pick up jobs from Redis queues. Batch exports stream data from ClickHouse to S3/Snowflake/BigQuery.",
    technicalSpecs: [
      { title: "Broker", details: "Redis" },
      { title: "Key Tasks", details: "Batch exports, cohort recalc, email reports" },
      { title: "Scheduling", details: "Celery beat for periodic tasks" },
    ],
    connections: {
      inputs: [{ name: "Django Web App", id: "django-web" }],
      outputs: [
        { name: "ClickHouse", id: "infra-clickhouse" },
        { name: "Object Storage", id: "infra-object-storage" },
      ],
    },
    dependencies: {
      external: ["celery", "redis", "clickhouse-driver"],
      internal: ["posthog/tasks", "posthog/batch_exports"],
    },
  },
  {
    id: "rust-capture",
    label: "Rust Services",
    type: "api",
    description: "High-performance Rust services: capture (events + recordings + AI + logs), feature-flags, property-defs, cyclotron, cymbal (error tracking), hook system (webhooks), personhog, batch-import-worker, embedding-worker.",
    stats: "Rust • Axum • 19 crates",
    level: "system",
    architecture: "Axum HTTP servers behind a Caddy reverse proxy. The capture service processes thousands of events/sec with minimal latency. Writes directly to Kafka with back-pressure handling.",
    technicalSpecs: [
      { title: "Capture", details: "Axum HTTP, token validation, Kafka producer" },
      { title: "Feature Flags", details: "Rust evaluation engine for low-latency flag checks" },
      { title: "Cyclotron", details: "Postgres-backed job queue for CDP transformations" },
    ],
    connections: {
      inputs: [],
      outputs: [{ name: "Kafka", id: "infra-kafka" }],
    },
    dependencies: {
      external: ["axum", "rdkafka", "tokio"],
      internal: ["rust/capture", "rust/feature-flags", "rust/cyclotron-core"],
    },
  },
  {
    id: "temporal-workers",
    label: "Temporal Workers",
    type: "utility",
    description: "Python Temporal workflow workers handling batch exports, data imports from 40+ sources, data modeling, experiment calculations, and session recording cleanup. Orchestrates long-running multi-step pipelines via Temporal server.",
    stats: "Python • Temporal • 55+ workflow types",
    level: "system",
    architecture: "Temporal workers register workflow and activity implementations. The Temporal server handles scheduling, retries, and state persistence. Workers connect to ClickHouse, S3, and external data sources.",
    technicalSpecs: [
      { title: "Runtime", details: "Python Temporal SDK workers" },
      { title: "Workflows", details: "Batch exports, data imports, data modeling, experiments" },
      { title: "Orchestration", details: "Temporal server manages state, retries, and scheduling" },
    ],
    connections: {
      inputs: [{ name: "Django Web App", id: "django-web" }],
      outputs: [
        { name: "Infrastructure", id: "infra-services" },
        { name: "Data Warehouses", id: "ext-warehouse-dest" },
      ],
    },
    dependencies: {
      external: ["temporalio", "clickhouse-driver", "boto3"],
      internal: ["posthog/temporal", "posthog/batch_exports"],
    },
  },
  {
    id: "livestream-service",
    label: "Livestream (Go)",
    type: "api",
    description: "Go service streaming live events to the browser via Server-Sent Events. Consumes from Redpanda and powers the real-time activity view at /activity/live. Includes GeoIP lookup.",
    stats: "Go • SSE • Kafka consumer",
    level: "system",
    architecture: "Go HTTP server consuming from Redpanda topics. Filters events by team and streams to connected browser clients via SSE. GeoIP enrichment for map visualizations.",
    technicalSpecs: [
      { title: "Transport", details: "Server-Sent Events (SSE) to browser clients" },
      { title: "Source", details: "Redpanda (Kafka-compatible) consumer" },
      { title: "Features", details: "GeoIP lookup, team-scoped filtering, Prometheus metrics" },
    ],
    connections: {
      inputs: [{ name: "Infrastructure", id: "infra-services" }],
      outputs: [],
    },
    dependencies: {
      external: ["kafka-go", "maxmind-geoip"],
      internal: ["livestream/"],
    },
  },
  {
    id: "infra-services",
    label: "Infrastructure",
    type: "data",
    description: "Redpanda (Kafka-compatible), ClickHouse, PostgreSQL, Redis, Temporal + Elasticsearch, Caddy proxy, MinIO/S3.",
    stats: "Redpanda • ClickHouse • PostgreSQL • Redis • S3",
    level: "system",
    architecture: "Managed or self-hosted infrastructure. ClickHouse is the core analytical engine. Redpanda (Kafka-compatible) decouples ingestion from storage. Redis provides caching and Celery brokering.",
    connections: {
      inputs: [
        { name: "Django Web App", id: "django-web" },
        { name: "Node.js Event Engine", id: "nodejs-engine" },
        { name: "Rust Services", id: "rust-capture" },
        { name: "Celery Workers", id: "celery-workers" },
        { name: "Temporal Workers", id: "temporal-workers" },
      ],
      outputs: [
        { name: "Livestream (Go)", id: "livestream-service" },
      ],
    },
    dependencies: {
      external: ["clickhouse", "postgresql", "redpanda", "redis", "s3"],
      internal: [],
    },
  },
];

export const systemEdges: GraphEdge[] = [
  // Frontend → Django
  { id: "se-fe-django", source: "react-frontend", target: "django-web", type: "call", label: "REST API calls" },
  { id: "se-django-fe", source: "django-web", target: "react-frontend", type: "data", label: "JSON responses" },

  // External traffic → Rust capture → Kafka
  { id: "se-sdk-capture", source: "rust-capture", target: "infra-services", type: "data", label: "Events → Redpanda" },

  // Kafka → Node.js Event Engine
  { id: "se-kafka-nodejs", source: "infra-services", target: "nodejs-engine", type: "data", label: "Kafka events" },
  { id: "se-nodejs-kafka", source: "nodejs-engine", target: "infra-services", type: "data", label: "Processed → ClickHouse" },

  // Django → ClickHouse (queries)
  { id: "se-django-ch", source: "django-web", target: "infra-services", type: "call", label: "HogQL → ClickHouse SQL" },
  { id: "se-ch-django", source: "infra-services", target: "django-web", type: "data", label: "Query results" },

  // Django → Celery
  { id: "se-django-celery", source: "django-web", target: "celery-workers", type: "call", label: "Enqueue tasks" },
  { id: "se-celery-infra", source: "celery-workers", target: "infra-services", type: "data", label: "Batch exports → S3" },

  // Django → Node.js Event Engine (config)
  { id: "se-django-nodejs", source: "django-web", target: "nodejs-engine", type: "call", label: "Plugin config" },

  // Django → Temporal Workers
  { id: "se-django-temporal", source: "django-web", target: "temporal-workers", type: "call", label: "Trigger workflows" },

  // Temporal Workers → Infrastructure + external
  { id: "se-temporal-infra", source: "temporal-workers", target: "infra-services", type: "data", label: "Reads CH, writes S3" },
  { id: "se-temporal-warehouse", source: "temporal-workers", target: "ext-warehouse-dest", type: "data", label: "Export data" },

  // Infrastructure → Livestream
  { id: "se-infra-livestream", source: "infra-services", target: "livestream-service", type: "data", label: "Kafka events" },
];

// ============================================================
// L3 — MODULE / COMPONENT LEVEL
// ============================================================

export const moduleNodes: GraphNode[] = [
  // ===== WEB-APP GROUP (Django Backend) =====
  {
    id: "mod-api-endpoints",
    label: "REST API",
    type: "api",
    description: "Django REST Framework ViewSets providing ~800 API endpoints for projects, insights, dashboards, feature flags, experiments, persons, and more.",
    stats: "posthog/api/ • ~120 ViewSets",
    level: "module",
    group: "web-app",
    purpose: "The primary interface between the frontend and backend, exposing all CRUD operations and query capabilities.",
    connections: {
      inputs: [{ name: "React Frontend", id: "mod-scenes" }],
      outputs: [
        { name: "Django Models", id: "mod-django-models" },
        { name: "HogQL Engine", id: "mod-hogql" },
      ],
    },
    dependencies: {
      external: ["djangorestframework"],
      internal: ["posthog/models", "posthog/hogql"],
    },
  },
  {
    id: "mod-django-models",
    label: "Django Models",
    type: "data",
    description: "Django ORM models defining the PostgreSQL schema: Team, Organization, Person, FeatureFlag, Dashboard, Insight, Cohort, Action, and hundreds more.",
    stats: "posthog/models/ • ~200 models",
    level: "module",
    group: "web-app",
    connections: {
      inputs: [{ name: "REST API", id: "mod-api-endpoints" }],
      outputs: [],
    },
    dependencies: {
      external: ["django"],
      internal: [],
    },
  },
  {
    id: "mod-hogql",
    label: "HogQL Engine",
    type: "utility",
    description: "PostHog's custom SQL-like query language. Parses HogQL strings into an AST, resolves types and table references, then prints ClickHouse-compatible SQL.",
    stats: "posthog/hogql/ • Parser → Resolver → Printer",
    level: "module",
    group: "web-app",
    purpose: "HogQL provides a safe, user-friendly SQL dialect that abstracts ClickHouse complexity while supporting PostHog-specific functions like person properties and cohort membership.",
    howItWorks: {
      overview: "A multi-stage compilation pipeline: HogQL source → ANTLR/C++ parser → AST → type resolution → ClickHouse SQL printing.",
      workflow: [
        { step: 1, description: "Parse HogQL string into AST nodes using ANTLR grammar (with C++ backend for performance)" },
        { step: 2, description: "Resolve table references, column types, and virtual tables (lazy tables, S3 tables)" },
        { step: 3, description: "Apply filters, property access transformations, and cohort expansion" },
        { step: 4, description: "Print the resolved AST as ClickHouse SQL via the ClickHousePrinter visitor" },
        { step: 5, description: "Execute the generated SQL against ClickHouse and return typed results" },
      ],
    },
    architectureDetails: {
      overview: "Visitor pattern throughout. The parser creates AST nodes, the Resolver visits them to add type info, and the Printer visits to generate SQL.",
      componentInteractions: [
        { component: "parser.py", role: "Parses HogQL strings using ANTLR grammar + C++ backend (hogql_parser)" },
        { component: "resolver.py", role: "Resolves types, table references, and lazy table joins" },
        { component: "printer/", role: "Visitors that generate ClickHouse, PostgreSQL, or HogQL output SQL" },
        { component: "query.py", role: "Orchestrates the full pipeline: parse → resolve → print → execute" },
      ],
    },
    connections: {
      inputs: [{ name: "REST API", id: "mod-api-endpoints" }],
      outputs: [],
    },
    dependencies: {
      external: ["antlr4", "hogql_parser", "clickhouse-driver"],
      internal: ["posthog/hogql/parser", "posthog/hogql/resolver", "posthog/hogql/printer"],
    },
  },
  {
    id: "mod-batch-exports",
    label: "Batch Exports",
    type: "utility",
    description: "Batch export definitions and configuration models. The stub lives at posthog/batch_exports/ (9 files); actual workflow implementation is in Temporal workflows at products/batch_exports/backend/temporal/destinations/.",
    stats: "posthog/batch_exports/ + products/batch_exports/ • Temporal workflows",
    level: "module",
    group: "web-app",
    connections: {
      inputs: [{ name: "REST API", id: "mod-api-endpoints" }],
      outputs: [],
    },
    dependencies: {
      external: ["celery", "boto3", "google-cloud-bigquery"],
      internal: ["posthog/models"],
    },
  },
  {
    id: "mod-warehouse",
    label: "Data Warehouse",
    type: "data",
    description: "Data warehouse integration allowing users to query external data sources (Stripe, Hubspot, Postgres, S3) alongside PostHog data using HogQL. Migrated to products/ directory.",
    stats: "products/data_warehouse/ • 98 Python files",
    level: "module",
    group: "web-app",
    connections: {
      inputs: [{ name: "HogQL Engine", id: "mod-hogql" }],
      outputs: [],
    },
    dependencies: {
      external: ["boto3"],
      internal: ["posthog/hogql"],
    },
  },
  {
    id: "mod-hogql-queries",
    label: "HogQL Query Runners",
    type: "api",
    description: "Query execution layer built on top of the HogQL engine. Contains query runners for insights, web analytics, experiments, AI queries, and event exploration. Bridges the REST API to HogQL compilation.",
    stats: "posthog/hogql_queries/ • 240 files",
    level: "module",
    group: "web-app",
    connections: {
      inputs: [{ name: "REST API", id: "mod-api-endpoints" }],
      outputs: [{ name: "HogQL Engine", id: "mod-hogql" }],
    },
    dependencies: {
      external: ["clickhouse-driver"],
      internal: ["posthog/hogql", "posthog/models"],
    },
  },
  {
    id: "mod-hogai",
    label: "HogAI (Max)",
    type: "utility",
    description: "AI assistant 'Max' powered by LLM integrations (OpenAI, Anthropic, Gemini). Includes chat agent, research agent, insights assistant, session summaries, video analysis, and MCP tools.",
    stats: "ee/hogai/ • 479 files • Chat + Research agents",
    level: "module",
    group: "web-app",
    connections: {
      inputs: [{ name: "REST API", id: "mod-api-endpoints" }],
      outputs: [{ name: "HogQL Query Runners", id: "mod-hogql-queries" }],
    },
    dependencies: {
      external: ["openai", "anthropic", "langchain"],
      internal: ["posthog/hogql_queries", "posthog/models"],
    },
  },
  {
    id: "mod-session-recordings",
    label: "Session Recordings",
    type: "component",
    description: "Session recording backend handling replay data queries, playlists, AI summaries, and recording metadata management.",
    stats: "posthog/session_recordings/ • 68 files",
    level: "module",
    group: "web-app",
    connections: {
      inputs: [{ name: "REST API", id: "mod-api-endpoints" }],
      outputs: [],
    },
    dependencies: {
      external: ["clickhouse-driver"],
      internal: ["posthog/models"],
    },
  },
  {
    id: "mod-clickhouse-schema",
    label: "ClickHouse Schema & Queries",
    type: "data",
    description: "SQL schema definitions, materialized views, ClickHouse DDL migrations, and raw ClickHouse query utilities that underpin all analytics. Imports table SQL from Django models.",
    stats: "posthog/clickhouse/ • 270 files",
    level: "module",
    group: "web-app",
    connections: {
      inputs: [],
      outputs: [{ name: "Django Models", id: "mod-django-models" }],
    },
    dependencies: {
      external: ["clickhouse-driver"],
      internal: ["posthog/models"],
    },
  },

  // ===== FRONTEND GROUP =====
  {
    id: "mod-scenes",
    label: "Scenes",
    type: "component",
    description: "Page-level React components — each scene maps to a route. Includes dashboards, insights, session replay, feature flags, experiments, surveys, data management, and more.",
    stats: "frontend/src/scenes/ • ~60 scenes",
    level: "module",
    group: "frontend",
    connections: {
      inputs: [],
      outputs: [
        { name: "Query System", id: "mod-fe-queries" },
        { name: "Kea Logic Stores", id: "mod-fe-lib" },
      ],
    },
    dependencies: {
      external: ["react", "kea", "antd"],
      internal: ["frontend/src/lib", "frontend/src/queries"],
    },
  },
  {
    id: "mod-fe-queries",
    label: "Query System",
    type: "utility",
    description: "Frontend query infrastructure. DataNode logic handles async query execution and polling. QueryEditor provides a HogQL editor with Monaco. DataTable and DataVisualization render results.",
    stats: "frontend/src/queries/ • DataNode, QueryEditor, DataTable",
    level: "module",
    group: "frontend",
    purpose: "Abstracts all data fetching into a declarative query model where scenes describe WHAT data they need and the query system handles HOW to fetch it.",
    connections: {
      inputs: [{ name: "Scenes", id: "mod-scenes" }],
      outputs: [{ name: "REST API", id: "mod-api-endpoints" }],
    },
    dependencies: {
      external: ["kea", "@monaco-editor/react"],
      internal: ["frontend/src/lib/api"],
    },
  },
  {
    id: "mod-fe-lib",
    label: "Core Libraries",
    type: "config",
    description: "Shared frontend utilities: API client, Kea logic stores for authentication and navigation, PostHog JS SDK integration, date/number formatting, and LemonUI component library.",
    stats: "frontend/src/lib/ • API client, utils, components",
    level: "module",
    group: "frontend",
    connections: {
      inputs: [{ name: "Scenes", id: "mod-scenes" }],
      outputs: [{ name: "REST API", id: "mod-api-endpoints" }],
    },
    dependencies: {
      external: ["kea", "posthog-js", "dayjs"],
      internal: [],
    },
  },
  {
    id: "mod-fe-layout",
    label: "App Layout",
    type: "component",
    description: "Application shell including navigation-3000 sidebar, panel layout system, global modals, error boundaries, and scene routing.",
    stats: "frontend/src/layout/ • 151 files",
    level: "module",
    group: "frontend",
    connections: {
      inputs: [{ name: "Scenes", id: "mod-scenes" }],
      outputs: [],
    },
    dependencies: {
      external: ["react", "kea"],
      internal: ["frontend/src/lib"],
    },
  },

  // ===== PLUGIN SERVER GROUP =====
  {
    id: "mod-cdp",
    label: "CDP Pipeline",
    type: "utility",
    description: "Customer Data Platform consumers. Processes events through user-configured destinations (webhooks, Slack, S3, etc.) and Hog-language transformations.",
    stats: "nodejs/src/cdp/ • 332 TS files",
    level: "module",
    group: "plugin-server",
    connections: {
      inputs: [{ name: "Ingestion Worker", id: "mod-ingestion" }],
      outputs: [],
    },
    dependencies: {
      external: ["kafkajs", "node-fetch"],
      internal: [],
    },
  },
  {
    id: "mod-ingestion",
    label: "Ingestion Worker",
    type: "utility",
    description: "Core ingestion pipeline. Consumes raw events from Kafka, runs person identification/merging, property processing, and writes enriched events to ClickHouse via Kafka.",
    stats: "nodejs/src/ingestion/ • 165 TS files",
    level: "module",
    group: "plugin-server",
    howItWorks: {
      overview: "A multi-step Kafka consumer pipeline that transforms raw captured events into enriched analytical events ready for ClickHouse.",
      workflow: [
        { step: 1, description: "Consume raw events from Kafka topic" },
        { step: 2, description: "Run person identification — match distinct_id to person_id, handle merges" },
        { step: 3, description: "Process person and group properties (set, set_once, unset)" },
        { step: 4, description: "Run pre-ingestion plugins/transformations" },
        { step: 5, description: "Write enriched events to ClickHouse Kafka topic" },
      ],
    },
    connections: {
      inputs: [],
      outputs: [{ name: "CDP Pipeline", id: "mod-cdp" }],
    },
    dependencies: {
      external: ["kafkajs", "node-rdkafka"],
      internal: [],
    },
  },
  {
    id: "mod-nodejs-recordings",
    label: "Recording Ingestion",
    type: "data",
    description: "Session recording ingestion pipeline in the Node.js service. Consumes recording snapshots from Redpanda and writes processed data for storage and replay.",
    stats: "nodejs/src/session-recording/ • 59 files",
    level: "module",
    group: "plugin-server",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: ["kafkajs"],
      internal: [],
    },
  },

  // ===== WORKERS GROUP (Celery) =====
  {
    id: "mod-celery-tasks",
    label: "Celery Tasks",
    type: "config",
    description: "Async task definitions for background processing. Includes scheduled exports, cohort recalculation, email digests, data deletion, and property definition updates.",
    stats: "posthog/tasks/ • ~50 task definitions",
    level: "module",
    group: "workers",
    connections: {
      inputs: [{ name: "REST API", id: "mod-api-endpoints" }],
      outputs: [{ name: "Batch Exports", id: "mod-batch-exports" }],
    },
    dependencies: {
      external: ["celery"],
      internal: ["posthog/models"],
    },
  },

  // ===== TEMPORAL GROUP =====
  {
    id: "mod-temporal-workflows",
    label: "Temporal Workflows",
    type: "utility",
    description: "Temporal workflow definitions and activities for batch exports, data imports (40+ sources), data modeling, LLM analytics, experiments, and messaging. Primary orchestration engine for long-running pipelines. Imports heavily from products/data_warehouse/.",
    stats: "posthog/temporal/ • 491 files • 27 workflow domains",
    level: "module",
    group: "temporal",
    connections: {
      inputs: [],
      outputs: [
        { name: "Data Warehouse", id: "mod-warehouse" },
        { name: "Batch Exports", id: "mod-batch-exports" },
      ],
    },
    dependencies: {
      external: ["temporalio", "clickhouse-driver", "boto3"],
      internal: ["posthog/batch_exports", "products/data_warehouse"],
    },
  },

  // ===== RUST SERVICES GROUP =====
  {
    id: "mod-rust-capture",
    label: "Event Capture",
    type: "api",
    description: "High-performance Rust HTTP endpoint handling all incoming analytics events. Validates API tokens, decompresses payloads, applies rate limiting, and produces events to Kafka.",
    stats: "rust/capture/ • Axum HTTP • ~40 source files",
    level: "module",
    group: "rust-services",
    purpose: "The first point of contact for all event data. Must handle extreme throughput with minimal latency while protecting downstream systems via rate limiting and token validation.",
    howItWorks: {
      overview: "Axum HTTP router receives POST requests, validates the project token, decompresses the payload, and produces events to Kafka topics.",
      workflow: [
        { step: 1, description: "Receive HTTP POST at /e, /capture, /batch endpoints via Axum router" },
        { step: 2, description: "Extract and validate project API token from payload or query params" },
        { step: 3, description: "Decompress body (gzip, lz4, or raw JSON)" },
        { step: 4, description: "Parse event payload and apply quota/rate limiting checks via Redis" },
        { step: 5, description: "Produce validated events to Kafka topic for downstream processing" },
      ],
    },
    connections: {
      inputs: [],
      outputs: [{ name: "Ingestion Worker", id: "mod-ingestion" }],
    },
    dependencies: {
      external: ["axum", "rdkafka", "tokio", "tower-http"],
      internal: [],
    },
  },
  {
    id: "mod-rust-feature-flags",
    label: "Feature Flag Service",
    type: "api",
    description: "Rust-native feature flag evaluation engine. Provides low-latency flag decisions at the edge, replacing the Python-based evaluation for performance-critical paths.",
    stats: "rust/feature-flags/ • Edge evaluation",
    level: "module",
    group: "rust-services",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: ["axum", "tokio"],
      internal: [],
    },
  },
  {
    id: "mod-rust-cyclotron",
    label: "Cyclotron (Job Queue)",
    type: "utility",
    description: "Postgres-backed job queue and scheduler for async task execution across Hog functions and CDP destinations. Manages job lifecycle, delivery guarantees, and retry policies.",
    stats: "rust/cyclotron-core/ • Job queue + scheduler",
    level: "module",
    group: "rust-services",
    connections: {
      inputs: [{ name: "CDP Pipeline", id: "mod-cdp" }],
      outputs: [],
    },
    dependencies: {
      external: ["tokio", "sqlx"],
      internal: [],
    },
  },
  {
    id: "mod-rust-property-defs",
    label: "Property Definitions",
    type: "data",
    description: "Rust service that maintains property definition metadata. Tracks which event and person properties exist, their types, and usage statistics.",
    stats: "rust/property-defs-rs/ • Metadata tracker",
    level: "module",
    group: "rust-services",
    connections: {
      inputs: [{ name: "Ingestion Worker", id: "mod-ingestion" }],
      outputs: [],
    },
    dependencies: {
      external: ["rdkafka", "tokio"],
      internal: [],
    },
  },
  {
    id: "mod-rust-cymbal",
    label: "Cymbal (Error Tracking)",
    type: "utility",
    description: "Error tracking symbolication service. Consumes from Kafka topic exceptions_ingestion, resolves source maps to human-readable stack traces, fingerprints errors, and produces to 5 downstream Kafka topics.",
    stats: "rust/cymbal/ • Symbolication + fingerprinting",
    level: "module",
    group: "rust-services",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: ["rdkafka", "tokio", "reqwest"],
      internal: [],
    },
  },
  {
    id: "mod-rust-hooks",
    label: "Hog Hooks (Webhooks)",
    type: "api",
    description: "Rust webhook delivery system. hook-api receives dispatch requests from CDP, hook-worker delivers webhooks via reqwest HTTP with retries, hook-janitor cleans up completed/failed jobs.",
    stats: "rust/hook-*/ • API + Worker + Janitor",
    level: "module",
    group: "rust-services",
    connections: {
      inputs: [{ name: "CDP Pipeline", id: "mod-cdp" }],
      outputs: [],
    },
    dependencies: {
      external: ["axum", "reqwest", "tokio"],
      internal: [],
    },
  },

  // ===== INFRASTRUCTURE GROUP =====
  {
    id: "infra-clickhouse",
    label: "ClickHouse",
    type: "data",
    description: "Column-oriented OLAP database. Stores all analytics events, session recordings metadata, and person properties. Handles billions of rows with sub-second queries.",
    stats: "Primary analytics store • Column-oriented",
    level: "module",
    group: "infrastructure",
    connections: {
      inputs: [
        { name: "HogQL Engine", id: "mod-hogql" },
        { name: "Ingestion Worker", id: "mod-ingestion" },
      ],
      outputs: [],
    },
    dependencies: { external: [], internal: [] },
  },
  {
    id: "infra-postgresql",
    label: "PostgreSQL",
    type: "data",
    description: "Stores all Django application state: user accounts, organizations, projects, feature flag definitions, dashboard layouts, plugin configurations, and batch export schedules.",
    stats: "Metadata store • Django ORM backend",
    level: "module",
    group: "infrastructure",
    connections: {
      inputs: [{ name: "Django Models", id: "mod-django-models" }],
      outputs: [],
    },
    dependencies: { external: [], internal: [] },
  },
  {
    id: "infra-kafka",
    label: "Kafka",
    type: "data",
    description: "Event streaming backbone. Topics include raw events from capture, processed events for ClickHouse, person updates, session recordings, and dead letter queues.",
    stats: "Event streaming • Multiple topics",
    level: "module",
    group: "infrastructure",
    connections: {
      inputs: [{ name: "Event Capture", id: "mod-rust-capture" }],
      outputs: [{ name: "Ingestion Worker", id: "mod-ingestion" }],
    },
    dependencies: { external: [], internal: [] },
  },
  {
    id: "infra-redis",
    label: "Redis",
    type: "data",
    description: "Multi-purpose in-memory store: Celery task broker, feature flag caching, rate limiting counters, real-time session tracking, and Django cache backend.",
    stats: "Cache & broker • Multi-purpose",
    level: "module",
    group: "infrastructure",
    connections: {
      inputs: [
        { name: "Celery Tasks", id: "mod-celery-tasks" },
        { name: "Event Capture", id: "mod-rust-capture" },
      ],
      outputs: [],
    },
    dependencies: { external: [], internal: [] },
  },

  // ===== LIVESTREAM GROUP =====
  {
    id: "mod-livestream-core",
    label: "Livestream Core",
    type: "api",
    description: "Go service entry point and event streaming handlers. Consumes events + session recordings from Redpanda, streams to browser clients via SSE. Includes GeoIP lookup, auth middleware, and Prometheus metrics.",
    stats: "livestream/ • main.go + handlers/ + events/ + auth/",
    level: "module",
    group: "livestream",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: ["kafka-go", "maxmind-geoip"],
      internal: [],
    },
  },
];

export const moduleEdges: GraphEdge[] = [
  // Frontend → Backend
  { id: "me-scenes-api", source: "mod-scenes", target: "mod-api-endpoints", type: "call", label: "REST API calls" },
  { id: "me-scenes-queries", source: "mod-scenes", target: "mod-fe-queries", type: "import", label: "Query components" },
  { id: "me-scenes-lib", source: "mod-scenes", target: "mod-fe-lib", type: "import", label: "Shared logic" },
  { id: "me-queries-api", source: "mod-fe-queries", target: "mod-api-endpoints", type: "call", label: "Query execution" },
  { id: "me-lib-api", source: "mod-fe-lib", target: "mod-api-endpoints", type: "call", label: "API client" },

  // Backend internal
  { id: "me-api-models", source: "mod-api-endpoints", target: "mod-django-models", type: "call", label: "ORM queries" },
  { id: "me-api-hogql", source: "mod-api-endpoints", target: "mod-hogql", type: "call", label: "HogQL queries" },
  { id: "me-api-batch", source: "mod-api-endpoints", target: "mod-batch-exports", type: "call", label: "Export config" },
  { id: "me-hogql-warehouse", source: "mod-hogql", target: "mod-warehouse", type: "import", label: "External tables" },
  { id: "me-api-tasks", source: "mod-api-endpoints", target: "mod-celery-tasks", type: "call", label: "Enqueue tasks" },

  // ClickHouse queries
  { id: "me-hogql-ch", source: "mod-hogql", target: "infra-clickhouse", type: "call", label: "ClickHouse SQL" },
  { id: "me-models-pg", source: "mod-django-models", target: "infra-postgresql", type: "data", label: "PostgreSQL" },

  // Ingestion pipeline
  { id: "me-capture-kafka", source: "mod-rust-capture", target: "infra-kafka", type: "data", label: "Raw events" },
  { id: "me-kafka-ingestion", source: "infra-kafka", target: "mod-ingestion", type: "data", label: "Event stream" },
  { id: "me-ingestion-ch", source: "mod-ingestion", target: "infra-clickhouse", type: "data", label: "Enriched events" },
  { id: "me-ingestion-cdp", source: "mod-ingestion", target: "mod-cdp", type: "data", label: "Post-ingestion" },
  { id: "me-ingestion-propdefs", source: "mod-ingestion", target: "mod-rust-property-defs", type: "data", label: "Property updates" },

  // Capture rate limiting
  { id: "me-capture-redis", source: "mod-rust-capture", target: "infra-redis", type: "call", label: "Rate limiting" },

  // Celery
  { id: "me-tasks-batch", source: "mod-celery-tasks", target: "mod-batch-exports", type: "call", label: "Run exports" },
  { id: "me-tasks-redis", source: "mod-celery-tasks", target: "infra-redis", type: "call", label: "Task broker" },

  // CDP → Cyclotron
  { id: "me-cdp-cyclotron", source: "mod-cdp", target: "mod-rust-cyclotron", type: "call", label: "Hog execution" },

  // New verified edges
  { id: "me-hogai-hogql-queries", source: "mod-hogai", target: "mod-hogql-queries", type: "call", label: "Query runners" },
  { id: "me-hogql-queries-hogql", source: "mod-hogql-queries", target: "mod-hogql", type: "call", label: "HogQL compilation" },
  { id: "me-hogql-queries-ch-schema", source: "mod-hogql-queries", target: "mod-clickhouse-schema", type: "call", label: "ClickHouse execution" },
  { id: "me-ch-schema-models", source: "mod-clickhouse-schema", target: "mod-django-models", type: "import", label: "Table SQL definitions" },
  { id: "me-ch-schema-infra", source: "mod-clickhouse-schema", target: "infra-clickhouse", type: "data", label: "DDL & migrations" },
  { id: "me-temporal-warehouse", source: "mod-temporal-workflows", target: "mod-warehouse", type: "call", label: "Data warehouse imports" },
  { id: "me-temporal-batch", source: "mod-temporal-workflows", target: "mod-batch-exports", type: "call", label: "Export orchestration" },
  { id: "me-session-recordings-ch", source: "mod-session-recordings", target: "infra-clickhouse", type: "call", label: "Recording queries" },
  { id: "me-nodejs-recordings-kafka", source: "mod-nodejs-recordings", target: "infra-kafka", type: "data", label: "Recording snapshots" },
  { id: "me-cymbal-kafka", source: "mod-rust-cymbal", target: "infra-kafka", type: "data", label: "exceptions_ingestion → 5 output topics" },
  { id: "me-hooks-cdp", source: "mod-rust-hooks", target: "mod-cdp", type: "call", label: "CDP webhook dispatch" },
  { id: "me-livestream-kafka", source: "mod-livestream-core", target: "infra-kafka", type: "data", label: "Consumes live events" },
  { id: "me-api-hogql-queries", source: "mod-api-endpoints", target: "mod-hogql-queries", type: "call", label: "Query execution" },
  { id: "me-api-hogai", source: "mod-api-endpoints", target: "mod-hogai", type: "call", label: "AI assistant" },
  { id: "me-scenes-layout", source: "mod-scenes", target: "mod-fe-layout", type: "import", label: "Navigation & shell" },
];

// ============================================================
// L4 — FILE / DIRECTORY LEVEL (complete directory decomposition)
// Generated from /tmp/posthog repo scan — every L3 module broken
// into immediate child directories (30+ files) or individual files (<30).
// No edges — proving why SCIP-based automation is necessary.
// ============================================================

export const fileNodes: GraphNode[] = [
  // ===== mod-scenes (2,120 files) — frontend/src/scenes/ =====
  { id: "dir-mod-scenes-authentication", label: "authentication/", type: "component", description: "frontend/src/scenes/authentication/", stats: "45 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-billing", label: "billing/", type: "component", description: "frontend/src/scenes/billing/", stats: "47 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-cohorts", label: "cohorts/", type: "component", description: "frontend/src/scenes/cohorts/", stats: "34 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-dashboard", label: "dashboard/", type: "component", description: "frontend/src/scenes/dashboard/", stats: "42 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-data-management", label: "data-management/", type: "component", description: "frontend/src/scenes/data-management/", stats: "56 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-data-pipelines", label: "data-pipelines/", type: "component", description: "frontend/src/scenes/data-pipelines/", stats: "42 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-data-warehouse", label: "data-warehouse/", type: "component", description: "frontend/src/scenes/data-warehouse/", stats: "83 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-experiments", label: "experiments/", type: "component", description: "frontend/src/scenes/experiments/", stats: "205 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-feature-flags", label: "feature-flags/", type: "component", description: "frontend/src/scenes/feature-flags/", stats: "47 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-funnels", label: "funnels/", type: "component", description: "frontend/src/scenes/funnels/", stats: "32 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-hog-functions", label: "hog-functions/", type: "component", description: "frontend/src/scenes/hog-functions/", stats: "49 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-insights", label: "insights/", type: "component", description: "frontend/src/scenes/insights/", stats: "177 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-max", label: "max/", type: "component", description: "frontend/src/scenes/max/", stats: "71 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-notebooks", label: "notebooks/", type: "component", description: "frontend/src/scenes/notebooks/", stats: "107 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-onboarding", label: "onboarding/", type: "component", description: "frontend/src/scenes/onboarding/", stats: "126 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-session-recordings", label: "session-recordings/", type: "component", description: "frontend/src/scenes/session-recordings/", stats: "230 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-settings", label: "settings/", type: "component", description: "frontend/src/scenes/settings/", stats: "140 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-surveys", label: "surveys/", type: "component", description: "frontend/src/scenes/surveys/", stats: "112 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-web-analytics", label: "web-analytics/", type: "component", description: "frontend/src/scenes/web-analytics/", stats: "104 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-product-tours", label: "product-tours/", type: "component", description: "frontend/src/scenes/product-tours/", stats: "35 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-persons", label: "persons/", type: "component", description: "frontend/src/scenes/persons/", stats: "24 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-heatmaps", label: "heatmaps/", type: "component", description: "frontend/src/scenes/heatmaps/", stats: "21 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-groups", label: "groups/", type: "component", description: "frontend/src/scenes/groups/", stats: "21 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-instance", label: "instance/", type: "component", description: "frontend/src/scenes/instance/", stats: "19 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-team-activity", label: "team-activity/", type: "component", description: "frontend/src/scenes/team-activity/", stats: "18 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-trends", label: "trends/", type: "component", description: "frontend/src/scenes/trends/", stats: "18 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-saved-insights", label: "saved-insights/", type: "component", description: "frontend/src/scenes/saved-insights/", stats: "17 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-activity", label: "activity/", type: "component", description: "frontend/src/scenes/activity/", stats: "14 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-retention", label: "retention/", type: "component", description: "frontend/src/scenes/retention/", stats: "14 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-debug", label: "debug/", type: "component", description: "frontend/src/scenes/debug/", stats: "11 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-paths", label: "paths/", type: "component", description: "frontend/src/scenes/paths/", stats: "12 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-sessions", label: "sessions/", type: "component", description: "frontend/src/scenes/sessions/", stats: "11 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-approvals", label: "approvals/", type: "component", description: "frontend/src/scenes/approvals/", stats: "10 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-audit-logs", label: "audit-logs/", type: "component", description: "frontend/src/scenes/audit-logs/", stats: "9 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-small", label: "(13 small scene dirs)", type: "component", description: "coupons, paths-v2, annotations, organization, comments, integrations, marketing-analytics, project-homepage, data-model, startups, health, PreflightCheck, Unsubscribe", stats: "74 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-tiny", label: "(15 tiny scene dirs)", type: "component", description: "oauth, persons-management, wizard, exports, models, project, sites, themes, toolbar-launch, IntegrationsRedirect, actions, alerts, moveToPostHogCloud, new-tab", stats: "24 source files", level: "file", group: "frontend", parentId: "mod-scenes" },
  { id: "dir-mod-scenes-root", label: "(root files)", type: "component", description: "frontend/src/scenes/", stats: "16 source files", level: "file", group: "frontend", parentId: "mod-scenes" },

  // ===== mod-fe-lib (912 files) — frontend/src/lib/ =====
  { id: "dir-mod-fe-lib-components", label: "components/", type: "config", description: "frontend/src/lib/components/", stats: "534 source files", level: "file", group: "frontend", parentId: "mod-fe-lib" },
  { id: "dir-mod-fe-lib-lemon-ui", label: "lemon-ui/", type: "config", description: "frontend/src/lib/lemon-ui/", stats: "197 source files", level: "file", group: "frontend", parentId: "mod-fe-lib" },
  { id: "dir-mod-fe-lib-utils", label: "utils/", type: "config", description: "frontend/src/lib/utils/", stats: "51 source files", level: "file", group: "frontend", parentId: "mod-fe-lib" },
  { id: "dir-mod-fe-lib-hooks", label: "hooks/", type: "config", description: "frontend/src/lib/hooks/", stats: "28 source files", level: "file", group: "frontend", parentId: "mod-fe-lib" },
  { id: "dir-mod-fe-lib-ui", label: "ui/", type: "config", description: "frontend/src/lib/ui/", stats: "26 source files", level: "file", group: "frontend", parentId: "mod-fe-lib" },
  { id: "dir-mod-fe-lib-integrations", label: "integrations/", type: "config", description: "frontend/src/lib/integrations/", stats: "25 source files", level: "file", group: "frontend", parentId: "mod-fe-lib" },
  { id: "dir-mod-fe-lib-monaco", label: "monaco/", type: "config", description: "frontend/src/lib/monaco/", stats: "12 source files", level: "file", group: "frontend", parentId: "mod-fe-lib" },
  { id: "dir-mod-fe-lib-logic", label: "logic/", type: "config", description: "frontend/src/lib/logic/", stats: "9 source files", level: "file", group: "frontend", parentId: "mod-fe-lib" },
  { id: "dir-mod-fe-lib-small", label: "(4 small dirs)", type: "config", description: "approvals, brand, forms, introductions", stats: "9 source files", level: "file", group: "frontend", parentId: "mod-fe-lib" },
  { id: "dir-mod-fe-lib-root", label: "(root files)", type: "config", description: "frontend/src/lib/", stats: "21 source files", level: "file", group: "frontend", parentId: "mod-fe-lib" },

  // ===== mod-temporal-workflows (652 files) — posthog/temporal/ + products/*/temporal/ =====
  { id: "dir-mod-temporal-data-imports", label: "data_imports/", type: "utility", description: "posthog/temporal/data_imports/", stats: "175 source files", level: "file", group: "temporal", parentId: "mod-temporal-workflows" },
  { id: "dir-mod-temporal-tests", label: "tests/", type: "utility", description: "posthog/temporal/tests/", stats: "90 source files", level: "file", group: "temporal", parentId: "mod-temporal-workflows" },
  { id: "dir-mod-temporal-llm-analytics", label: "llm_analytics/", type: "utility", description: "posthog/temporal/llm_analytics/", stats: "46 source files", level: "file", group: "temporal", parentId: "mod-temporal-workflows" },
  { id: "dir-mod-temporal-ai", label: "ai/", type: "utility", description: "posthog/temporal/ai/", stats: "40 source files", level: "file", group: "temporal", parentId: "mod-temporal-workflows" },
  { id: "dir-mod-temporal-common", label: "common/", type: "utility", description: "posthog/temporal/common/", stats: "17 source files", level: "file", group: "temporal", parentId: "mod-temporal-workflows" },
  { id: "dir-mod-temporal-ingestion-test", label: "ingestion_acceptance_test/", type: "utility", description: "posthog/temporal/ingestion_acceptance_test/", stats: "18 source files", level: "file", group: "temporal", parentId: "mod-temporal-workflows" },
  { id: "dir-mod-temporal-data-modeling", label: "data_modeling/", type: "utility", description: "posthog/temporal/data_modeling/", stats: "14 source files", level: "file", group: "temporal", parentId: "mod-temporal-workflows" },
  { id: "dir-mod-temporal-messaging", label: "messaging/", type: "utility", description: "posthog/temporal/messaging/", stats: "12 source files", level: "file", group: "temporal", parentId: "mod-temporal-workflows" },
  { id: "dir-mod-temporal-proxy-service", label: "proxy_service/", type: "utility", description: "posthog/temporal/proxy_service/", stats: "10 source files", level: "file", group: "temporal", parentId: "mod-temporal-workflows" },
  { id: "dir-mod-temporal-small", label: "(18 small workflow dirs)", type: "utility", description: "ducklake, experiments, weekly_digest, delete_recordings, cleanup_property_definitions, enforce_max_replay_retention, export_recording, import_recording, backfill_materialized_property, dlq_replay, exports_video, product_analytics, sync_person_distinct_ids, delete_persons, quota_limiting, salesforce_enrichment, subscriptions, usage_reports", stats: "56 source files", level: "file", group: "temporal", parentId: "mod-temporal-workflows" },
  { id: "dir-mod-temporal-products", label: "products/*/temporal/", type: "utility", description: "products/batch_exports/backend/temporal + products/tasks/backend/temporal + products/signals/backend/temporal", stats: "161 source files", level: "file", group: "temporal", parentId: "mod-temporal-workflows" },
  { id: "dir-mod-temporal-root", label: "(root files)", type: "utility", description: "posthog/temporal/", stats: "4 source files", level: "file", group: "temporal", parentId: "mod-temporal-workflows" },

  // ===== mod-hogai (479 files) — ee/hogai/ =====
  { id: "dir-mod-hogai-chat-agent", label: "chat_agent/", type: "utility", description: "ee/hogai/chat_agent/", stats: "128 source files", level: "file", group: "web-app", parentId: "mod-hogai" },
  { id: "dir-mod-hogai-tools", label: "tools/", type: "utility", description: "ee/hogai/tools/", stats: "68 source files", level: "file", group: "web-app", parentId: "mod-hogai" },
  { id: "dir-mod-hogai-core", label: "core/", type: "utility", description: "ee/hogai/core/", stats: "57 source files", level: "file", group: "web-app", parentId: "mod-hogai" },
  { id: "dir-mod-hogai-context", label: "context/", type: "utility", description: "ee/hogai/context/", stats: "51 source files", level: "file", group: "web-app", parentId: "mod-hogai" },
  { id: "dir-mod-hogai-eval", label: "eval/", type: "utility", description: "ee/hogai/eval/", stats: "36 source files", level: "file", group: "web-app", parentId: "mod-hogai" },
  { id: "dir-mod-hogai-utils", label: "utils/", type: "utility", description: "ee/hogai/utils/", stats: "35 source files", level: "file", group: "web-app", parentId: "mod-hogai" },
  { id: "dir-mod-hogai-session-summaries", label: "session_summaries/", type: "utility", description: "ee/hogai/session_summaries/", stats: "26 source files", level: "file", group: "web-app", parentId: "mod-hogai" },
  { id: "dir-mod-hogai-research-agent", label: "research_agent/", type: "utility", description: "ee/hogai/research_agent/", stats: "14 source files", level: "file", group: "web-app", parentId: "mod-hogai" },
  { id: "dir-mod-hogai-test", label: "test/", type: "utility", description: "ee/hogai/test/", stats: "14 source files", level: "file", group: "web-app", parentId: "mod-hogai" },
  { id: "dir-mod-hogai-small", label: "(7 small dirs)", type: "utility", description: "llm_traces_summaries, artifacts, summarizers, api, stream, django_checkpoint, videos", stats: "42 source files", level: "file", group: "web-app", parentId: "mod-hogai" },
  { id: "dir-mod-hogai-root", label: "(root files)", type: "utility", description: "ee/hogai/", stats: "8 source files", level: "file", group: "web-app", parentId: "mod-hogai" },

  // ===== mod-django-models (296 files) — posthog/models/ =====
  { id: "dir-mod-django-models-root", label: "(root files)", type: "data", description: "posthog/models/", stats: "66 source files", level: "file", group: "web-app", parentId: "mod-django-models" },
  { id: "dir-mod-django-models-test", label: "test/", type: "data", description: "posthog/models/test/", stats: "40 source files", level: "file", group: "web-app", parentId: "mod-django-models" },
  { id: "dir-mod-django-models-filters", label: "filters/", type: "data", description: "posthog/models/filters/", stats: "31 source files", level: "file", group: "web-app", parentId: "mod-django-models" },
  { id: "dir-mod-django-models-activity-logging", label: "activity_logging/", type: "data", description: "posthog/models/activity_logging/", stats: "13 source files", level: "file", group: "web-app", parentId: "mod-django-models" },
  { id: "dir-mod-django-models-feature-flag", label: "feature_flag/", type: "data", description: "posthog/models/feature_flag/", stats: "12 source files", level: "file", group: "web-app", parentId: "mod-django-models" },
  { id: "dir-mod-django-models-file-system", label: "file_system/", type: "data", description: "posthog/models/file_system/", stats: "12 source files", level: "file", group: "web-app", parentId: "mod-django-models" },
  { id: "dir-mod-django-models-cohort", label: "cohort/", type: "data", description: "posthog/models/cohort/", stats: "9 source files", level: "file", group: "web-app", parentId: "mod-django-models" },
  { id: "dir-mod-django-models-async-deletion", label: "async_deletion/", type: "data", description: "posthog/models/async_deletion/", stats: "8 source files", level: "file", group: "web-app", parentId: "mod-django-models" },
  { id: "dir-mod-django-models-web-preagg", label: "web_preaggregated/", type: "data", description: "posthog/models/web_preaggregated/", stats: "8 source files", level: "file", group: "web-app", parentId: "mod-django-models" },
  { id: "dir-mod-django-models-team", label: "team/", type: "data", description: "posthog/models/team/", stats: "7 source files", level: "file", group: "web-app", parentId: "mod-django-models" },
  { id: "dir-mod-django-models-person", label: "person/", type: "data", description: "posthog/models/person/", stats: "6 source files", level: "file", group: "web-app", parentId: "mod-django-models" },
  { id: "dir-mod-django-models-small", label: "(30 small model dirs)", type: "data", description: "event, property, raw_sessions, surveys, action, group, ai, comment, distinct_id_usage, element, entity, exchange_rate, hog_flow, hog_functions, app_metrics, app_metrics2, channel_type, cohortmembership, duplicate_events, ingestion_warnings, kafka_debug, kafka_partition_stats, performance, person_overrides, precalculated_events, precalculated_person_properties, product_intent, query_metrics, sessions, user_group", stats: "85 source files", level: "file", group: "web-app", parentId: "mod-django-models" },

  // ===== mod-cdp (334 files) — nodejs/src/cdp/ =====
  { id: "dir-mod-cdp-legacy-plugins", label: "legacy-plugins/", type: "utility", description: "nodejs/src/cdp/legacy-plugins/", stats: "119 source files", level: "file", group: "plugin-server", parentId: "mod-cdp" },
  { id: "dir-mod-cdp-services", label: "services/", type: "utility", description: "nodejs/src/cdp/services/", stats: "74 source files", level: "file", group: "plugin-server", parentId: "mod-cdp" },
  { id: "dir-mod-cdp-templates", label: "templates/", type: "utility", description: "nodejs/src/cdp/templates/", stats: "71 source files", level: "file", group: "plugin-server", parentId: "mod-cdp" },
  { id: "dir-mod-cdp-consumers", label: "consumers/", type: "utility", description: "nodejs/src/cdp/consumers/", stats: "28 source files", level: "file", group: "plugin-server", parentId: "mod-cdp" },
  { id: "dir-mod-cdp-utils", label: "utils/", type: "utility", description: "nodejs/src/cdp/utils/", stats: "13 source files", level: "file", group: "plugin-server", parentId: "mod-cdp" },
  { id: "dir-mod-cdp-small", label: "(4 small dirs)", type: "utility", description: "_tests, legacy-webhooks, hog-transformations, segment", stats: "21 source files", level: "file", group: "plugin-server", parentId: "mod-cdp" },
  { id: "dir-mod-cdp-root", label: "(root files)", type: "utility", description: "nodejs/src/cdp/", stats: "8 source files", level: "file", group: "plugin-server", parentId: "mod-cdp" },

  // ===== mod-api-endpoints (282 files) — posthog/api/ =====
  { id: "dir-mod-api-test", label: "test/", type: "api", description: "posthog/api/test/", stats: "127 source files", level: "file", group: "web-app", parentId: "mod-api-endpoints" },
  { id: "dir-mod-api-root", label: "(root files)", type: "api", description: "posthog/api/", stats: "98 source files", level: "file", group: "web-app", parentId: "mod-api-endpoints" },
  { id: "dir-mod-api-file-system", label: "file_system/", type: "api", description: "posthog/api/file_system/", stats: "13 source files", level: "file", group: "web-app", parentId: "mod-api-endpoints" },
  { id: "dir-mod-api-advanced-activity", label: "advanced_activity_logs/", type: "api", description: "posthog/api/advanced_activity_logs/", stats: "9 source files", level: "file", group: "web-app", parentId: "mod-api-endpoints" },
  { id: "dir-mod-api-external-web", label: "external_web_analytics/", type: "api", description: "posthog/api/external_web_analytics/", stats: "8 source files", level: "file", group: "web-app", parentId: "mod-api-endpoints" },
  { id: "dir-mod-api-small", label: "(5 small dirs)", type: "api", description: "oauth, dashboards, wizard, event_definition_generators, services", stats: "27 source files", level: "file", group: "web-app", parentId: "mod-api-endpoints" },

  // ===== mod-fe-layout (151 files) — frontend/src/layout/ =====
  { id: "dir-mod-fe-layout-nav3000", label: "navigation-3000/", type: "component", description: "frontend/src/layout/navigation-3000/", stats: "70 source files", level: "file", group: "frontend", parentId: "mod-fe-layout" },
  { id: "dir-mod-fe-layout-panel", label: "panel-layout/", type: "component", description: "frontend/src/layout/panel-layout/", stats: "38 source files", level: "file", group: "frontend", parentId: "mod-fe-layout" },
  { id: "dir-mod-fe-layout-navigation", label: "navigation/", type: "component", description: "frontend/src/layout/navigation/", stats: "19 source files", level: "file", group: "frontend", parentId: "mod-fe-layout" },
  { id: "dir-mod-fe-layout-scenes", label: "scenes/", type: "component", description: "frontend/src/layout/scenes/", stats: "11 source files", level: "file", group: "frontend", parentId: "mod-fe-layout" },
  { id: "dir-mod-fe-layout-small", label: "(2 small dirs)", type: "component", description: "FeaturePreviews, ErrorBoundary", stats: "6 source files", level: "file", group: "frontend", parentId: "mod-fe-layout" },
  { id: "dir-mod-fe-layout-root", label: "(root files)", type: "component", description: "frontend/src/layout/", stats: "7 source files", level: "file", group: "frontend", parentId: "mod-fe-layout" },

  // ===== mod-fe-queries (159 files) — frontend/src/queries/ =====
  { id: "dir-mod-fe-queries-nodes", label: "nodes/", type: "utility", description: "frontend/src/queries/nodes/", stats: "133 source files", level: "file", group: "frontend", parentId: "mod-fe-queries" },
  { id: "dir-mod-fe-queries-schema", label: "schema/", type: "utility", description: "frontend/src/queries/schema/", stats: "11 source files", level: "file", group: "frontend", parentId: "mod-fe-queries" },
  { id: "dir-mod-fe-queries-small", label: "(3 small dirs)", type: "utility", description: "QueryEditor, Query, hooks", stats: "4 source files", level: "file", group: "frontend", parentId: "mod-fe-queries" },
  { id: "dir-mod-fe-queries-root", label: "(root files)", type: "utility", description: "frontend/src/queries/", stats: "11 source files", level: "file", group: "frontend", parentId: "mod-fe-queries" },

  // ===== mod-hogql-queries (240 files) — posthog/hogql_queries/ =====
  { id: "dir-mod-hogql-queries-insights", label: "insights/", type: "api", description: "posthog/hogql_queries/insights/", stats: "81 source files", level: "file", group: "web-app", parentId: "mod-hogql-queries" },
  { id: "dir-mod-hogql-queries-web-analytics", label: "web_analytics/", type: "api", description: "posthog/hogql_queries/web_analytics/", stats: "44 source files", level: "file", group: "web-app", parentId: "mod-hogql-queries" },
  { id: "dir-mod-hogql-queries-experiments", label: "experiments/", type: "api", description: "posthog/hogql_queries/experiments/", stats: "39 source files", level: "file", group: "web-app", parentId: "mod-hogql-queries" },
  { id: "dir-mod-hogql-queries-ai", label: "ai/", type: "api", description: "posthog/hogql_queries/ai/", stats: "21 source files", level: "file", group: "web-app", parentId: "mod-hogql-queries" },
  { id: "dir-mod-hogql-queries-test", label: "test/", type: "api", description: "posthog/hogql_queries/test/", stats: "13 source files", level: "file", group: "web-app", parentId: "mod-hogql-queries" },
  { id: "dir-mod-hogql-queries-utils", label: "utils/", type: "api", description: "posthog/hogql_queries/utils/", stats: "12 source files", level: "file", group: "web-app", parentId: "mod-hogql-queries" },
  { id: "dir-mod-hogql-queries-small", label: "(3 small dirs)", type: "api", description: "endpoints, legacy_compatibility, groups", stats: "15 source files", level: "file", group: "web-app", parentId: "mod-hogql-queries" },
  { id: "dir-mod-hogql-queries-root", label: "(root files)", type: "api", description: "posthog/hogql_queries/", stats: "15 source files", level: "file", group: "web-app", parentId: "mod-hogql-queries" },

  // ===== mod-hogql (185 files) — posthog/hogql/ =====
  { id: "dir-mod-hogql-database", label: "database/", type: "utility", description: "posthog/hogql/database/", stats: "70 source files", level: "file", group: "web-app", parentId: "mod-hogql" },
  { id: "dir-mod-hogql-functions", label: "functions/", type: "utility", description: "posthog/hogql/functions/", stats: "30 source files", level: "file", group: "web-app", parentId: "mod-hogql" },
  { id: "dir-mod-hogql-root", label: "(root files)", type: "utility", description: "posthog/hogql/", stats: "28 source files", level: "file", group: "web-app", parentId: "mod-hogql" },
  { id: "dir-mod-hogql-test", label: "test/", type: "utility", description: "posthog/hogql/test/", stats: "25 source files", level: "file", group: "web-app", parentId: "mod-hogql" },
  { id: "dir-mod-hogql-transforms", label: "transforms/", type: "utility", description: "posthog/hogql/transforms/", stats: "15 source files", level: "file", group: "web-app", parentId: "mod-hogql" },
  { id: "dir-mod-hogql-printer", label: "printer/", type: "utility", description: "posthog/hogql/printer/", stats: "7 source files", level: "file", group: "web-app", parentId: "mod-hogql" },
  { id: "dir-mod-hogql-compiler", label: "compiler/", type: "utility", description: "posthog/hogql/compiler/", stats: "5 source files", level: "file", group: "web-app", parentId: "mod-hogql" },
  { id: "dir-mod-hogql-small", label: "(2 small dirs)", type: "utility", description: "grammar, helpers", stats: "5 source files", level: "file", group: "web-app", parentId: "mod-hogql" },

  // ===== mod-ingestion (165 files) — nodejs/src/ingestion/ =====
  { id: "dir-mod-ingestion-pipelines", label: "pipelines/", type: "utility", description: "nodejs/src/ingestion/pipelines/", stats: "55 source files", level: "file", group: "plugin-server", parentId: "mod-ingestion" },
  { id: "dir-mod-ingestion-event-preprocessing", label: "event-preprocessing/", type: "utility", description: "nodejs/src/ingestion/event-preprocessing/", stats: "32 source files", level: "file", group: "plugin-server", parentId: "mod-ingestion" },
  { id: "dir-mod-ingestion-ai", label: "ai/", type: "utility", description: "nodejs/src/ingestion/ai/", stats: "26 source files", level: "file", group: "plugin-server", parentId: "mod-ingestion" },
  { id: "dir-mod-ingestion-event-processing", label: "event-processing/", type: "utility", description: "nodejs/src/ingestion/event-processing/", stats: "21 source files", level: "file", group: "plugin-server", parentId: "mod-ingestion" },
  { id: "dir-mod-ingestion-analytics", label: "analytics/", type: "utility", description: "nodejs/src/ingestion/analytics/", stats: "10 source files", level: "file", group: "plugin-server", parentId: "mod-ingestion" },
  { id: "dir-mod-ingestion-utils", label: "utils/", type: "utility", description: "nodejs/src/ingestion/utils/", stats: "10 source files", level: "file", group: "plugin-server", parentId: "mod-ingestion" },
  { id: "dir-mod-ingestion-small", label: "(2 small dirs)", type: "utility", description: "cookieless, session_replay", stats: "6 source files", level: "file", group: "plugin-server", parentId: "mod-ingestion" },
  { id: "dir-mod-ingestion-root", label: "(root files)", type: "utility", description: "nodejs/src/ingestion/", stats: "5 source files", level: "file", group: "plugin-server", parentId: "mod-ingestion" },

  // ===== mod-batch-exports (142 files) — posthog/batch_exports/ + products/batch_exports/ =====
  { id: "dir-mod-batch-exports-tests", label: "backend/tests/", type: "utility", description: "products/batch_exports/backend/tests/", stats: "90 source files", level: "file", group: "web-app", parentId: "mod-batch-exports" },
  { id: "dir-mod-batch-exports-temporal", label: "backend/temporal/", type: "utility", description: "products/batch_exports/backend/temporal/", stats: "31 source files", level: "file", group: "web-app", parentId: "mod-batch-exports" },
  { id: "dir-mod-batch-exports-api", label: "backend/api/", type: "utility", description: "products/batch_exports/backend/api/", stats: "8 source files", level: "file", group: "web-app", parentId: "mod-batch-exports" },
  { id: "dir-mod-batch-exports-legacy", label: "posthog/batch_exports/", type: "utility", description: "posthog/batch_exports/ (models, service, sql, http, debug)", stats: "9 source files", level: "file", group: "web-app", parentId: "mod-batch-exports" },
  { id: "dir-mod-batch-exports-frontend", label: "frontend/", type: "utility", description: "products/batch_exports/frontend/", stats: "2 source files", level: "file", group: "web-app", parentId: "mod-batch-exports" },

  // ===== mod-rust-cymbal (65 files) — rust/cymbal/ =====
  { id: "dir-mod-rust-cymbal-src-root", label: "src/ (root)", type: "utility", description: "rust/cymbal/src/", stats: "13 source files", level: "file", group: "rust-services", parentId: "mod-rust-cymbal" },
  { id: "dir-mod-rust-cymbal-langs", label: "src/langs/", type: "utility", description: "rust/cymbal/src/langs/", stats: "12 source files", level: "file", group: "rust-services", parentId: "mod-rust-cymbal" },
  { id: "dir-mod-rust-cymbal-pipeline", label: "src/pipeline/", type: "utility", description: "rust/cymbal/src/pipeline/", stats: "12 source files", level: "file", group: "rust-services", parentId: "mod-rust-cymbal" },
  { id: "dir-mod-rust-cymbal-symbol-store", label: "src/symbol_store/", type: "utility", description: "rust/cymbal/src/symbol_store/", stats: "10 source files", level: "file", group: "rust-services", parentId: "mod-rust-cymbal" },
  { id: "dir-mod-rust-cymbal-small", label: "(4 small dirs)", type: "utility", description: "frames, router, bin, fingerprinting, types", stats: "12 source files", level: "file", group: "rust-services", parentId: "mod-rust-cymbal" },
  { id: "dir-mod-rust-cymbal-tests", label: "tests/", type: "utility", description: "rust/cymbal/tests/", stats: "6 source files", level: "file", group: "rust-services", parentId: "mod-rust-cymbal" },

  // ===== mod-rust-feature-flags (80 files) — rust/feature-flags/ =====
  { id: "dir-mod-rust-ff-flags", label: "src/flags/", type: "api", description: "rust/feature-flags/src/flags/", stats: "16 source files", level: "file", group: "rust-services", parentId: "mod-rust-feature-flags" },
  { id: "dir-mod-rust-ff-handler", label: "src/handler/", type: "api", description: "rust/feature-flags/src/handler/", stats: "14 source files", level: "file", group: "rust-services", parentId: "mod-rust-feature-flags" },
  { id: "dir-mod-rust-ff-api", label: "src/api/", type: "api", description: "rust/feature-flags/src/api/", stats: "9 source files", level: "file", group: "rust-services", parentId: "mod-rust-feature-flags" },
  { id: "dir-mod-rust-ff-src-root", label: "src/ (root)", type: "api", description: "rust/feature-flags/src/", stats: "9 source files", level: "file", group: "rust-services", parentId: "mod-rust-feature-flags" },
  { id: "dir-mod-rust-ff-tests", label: "tests/", type: "api", description: "rust/feature-flags/tests/", stats: "9 source files", level: "file", group: "rust-services", parentId: "mod-rust-feature-flags" },
  { id: "dir-mod-rust-ff-small", label: "(6 small dirs)", type: "api", description: "utils, cohorts, properties, database, metrics, team, site_apps", stats: "23 source files", level: "file", group: "rust-services", parentId: "mod-rust-feature-flags" },

  // ===== mod-rust-capture (57 files) — rust/capture/ =====
  { id: "dir-mod-rust-capture-src-root", label: "src/ (root)", type: "api", description: "rust/capture/src/", stats: "22 source files", level: "file", group: "rust-services", parentId: "mod-rust-capture" },
  { id: "dir-mod-rust-capture-tests", label: "tests/", type: "api", description: "rust/capture/tests/", stats: "16 source files", level: "file", group: "rust-services", parentId: "mod-rust-capture" },
  { id: "dir-mod-rust-capture-payload", label: "src/payload/", type: "api", description: "rust/capture/src/payload/", stats: "6 source files", level: "file", group: "rust-services", parentId: "mod-rust-capture" },
  { id: "dir-mod-rust-capture-sinks", label: "src/sinks/", type: "api", description: "rust/capture/src/sinks/", stats: "6 source files", level: "file", group: "rust-services", parentId: "mod-rust-capture" },
  { id: "dir-mod-rust-capture-small", label: "(2 small dirs)", type: "api", description: "event_restrictions, events", stats: "7 source files", level: "file", group: "rust-services", parentId: "mod-rust-capture" },

  // ===== mod-celery-tasks (84 files) — posthog/tasks/ =====
  { id: "dir-mod-celery-tasks-root", label: "(root files)", type: "config", description: "posthog/tasks/", stats: "37 source files", level: "file", group: "workers", parentId: "mod-celery-tasks" },
  { id: "dir-mod-celery-tasks-test", label: "test/", type: "config", description: "posthog/tasks/test/", stats: "26 source files", level: "file", group: "workers", parentId: "mod-celery-tasks" },
  { id: "dir-mod-celery-tasks-exports", label: "exports/", type: "config", description: "posthog/tasks/exports/", stats: "13 source files", level: "file", group: "workers", parentId: "mod-celery-tasks" },
  { id: "dir-mod-celery-tasks-alerts", label: "alerts/", type: "config", description: "posthog/tasks/alerts/", stats: "8 source files", level: "file", group: "workers", parentId: "mod-celery-tasks" },

  // ===== mod-warehouse (102 files) — products/data_warehouse/ =====
  { id: "dir-mod-warehouse-backend", label: "backend/", type: "data", description: "products/data_warehouse/backend/", stats: "93 source files", level: "file", group: "web-app", parentId: "mod-warehouse" },
  { id: "dir-mod-warehouse-dags", label: "dags/", type: "data", description: "products/data_warehouse/dags/", stats: "4 source files", level: "file", group: "web-app", parentId: "mod-warehouse" },
  { id: "dir-mod-warehouse-root", label: "(root files)", type: "data", description: "products/data_warehouse/", stats: "3 source files", level: "file", group: "web-app", parentId: "mod-warehouse" },
  { id: "dir-mod-warehouse-frontend", label: "frontend/", type: "data", description: "products/data_warehouse/frontend/", stats: "2 source files", level: "file", group: "web-app", parentId: "mod-warehouse" },

  // ===== mod-session-recordings (68 files) — posthog/session_recordings/ =====
  { id: "dir-mod-session-recordings-queries", label: "queries/", type: "component", description: "posthog/session_recordings/queries/", stats: "26 source files", level: "file", group: "web-app", parentId: "mod-session-recordings" },
  { id: "dir-mod-session-recordings-test", label: "test/", type: "component", description: "posthog/session_recordings/test/", stats: "12 source files", level: "file", group: "web-app", parentId: "mod-session-recordings" },
  { id: "dir-mod-session-recordings-root", label: "(root files)", type: "component", description: "posthog/session_recordings/", stats: "10 source files", level: "file", group: "web-app", parentId: "mod-session-recordings" },
  { id: "dir-mod-session-recordings-models", label: "models/", type: "component", description: "posthog/session_recordings/models/", stats: "8 source files", level: "file", group: "web-app", parentId: "mod-session-recordings" },
  { id: "dir-mod-session-recordings-sql", label: "sql/", type: "component", description: "posthog/session_recordings/sql/", stats: "5 source files", level: "file", group: "web-app", parentId: "mod-session-recordings" },
  { id: "dir-mod-session-recordings-small", label: "(2 small dirs)", type: "component", description: "playlist_counters, ai_data", stats: "7 source files", level: "file", group: "web-app", parentId: "mod-session-recordings" },

  // ===== mod-clickhouse-schema (270 files) — posthog/clickhouse/ =====
  { id: "dir-mod-clickhouse-migrations", label: "migrations/", type: "data", description: "posthog/clickhouse/migrations/", stats: "218 source files", level: "file", group: "web-app", parentId: "mod-clickhouse-schema" },
  { id: "dir-mod-clickhouse-root", label: "(root files)", type: "data", description: "posthog/clickhouse/", stats: "22 source files", level: "file", group: "web-app", parentId: "mod-clickhouse-schema" },
  { id: "dir-mod-clickhouse-client", label: "client/", type: "data", description: "posthog/clickhouse/client/", stats: "14 source files", level: "file", group: "web-app", parentId: "mod-clickhouse-schema" },
  { id: "dir-mod-clickhouse-test", label: "test/", type: "data", description: "posthog/clickhouse/test/", stats: "13 source files", level: "file", group: "web-app", parentId: "mod-clickhouse-schema" },
  { id: "dir-mod-clickhouse-preagg", label: "preaggregation/", type: "data", description: "posthog/clickhouse/preaggregation/", stats: "3 source files", level: "file", group: "web-app", parentId: "mod-clickhouse-schema" },

  // ===== mod-nodejs-recordings (59 files) — nodejs/src/session-recording/ =====
  { id: "dir-mod-nodejs-recordings-sessions", label: "sessions/", type: "data", description: "nodejs/src/session-recording/sessions/", stats: "28 source files", level: "file", group: "plugin-server", parentId: "mod-nodejs-recordings" },
  { id: "dir-mod-nodejs-recordings-root", label: "(root files)", type: "data", description: "nodejs/src/session-recording/", stats: "11 source files", level: "file", group: "plugin-server", parentId: "mod-nodejs-recordings" },
  { id: "dir-mod-nodejs-recordings-kafka", label: "kafka/", type: "data", description: "nodejs/src/session-recording/kafka/", stats: "6 source files", level: "file", group: "plugin-server", parentId: "mod-nodejs-recordings" },
  { id: "dir-mod-nodejs-recordings-teams", label: "teams/", type: "data", description: "nodejs/src/session-recording/teams/", stats: "6 source files", level: "file", group: "plugin-server", parentId: "mod-nodejs-recordings" },
  { id: "dir-mod-nodejs-recordings-retention", label: "retention/", type: "data", description: "nodejs/src/session-recording/retention/", stats: "5 source files", level: "file", group: "plugin-server", parentId: "mod-nodejs-recordings" },
  { id: "dir-mod-nodejs-recordings-versions", label: "versions/", type: "data", description: "nodejs/src/session-recording/versions/", stats: "3 source files", level: "file", group: "plugin-server", parentId: "mod-nodejs-recordings" },

  // ===== mod-rust-hooks (23 files) — individual file listing =====
  { id: "file-mod-rust-hooks-api-main", label: "main.rs", type: "api", description: "rust/hook-api/src/main.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-api-config", label: "config.rs", type: "api", description: "rust/hook-api/src/config.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-api-handlers-mod", label: "handlers/mod.rs", type: "api", description: "rust/hook-api/src/handlers/mod.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-api-handlers-app", label: "handlers/app.rs", type: "api", description: "rust/hook-api/src/handlers/app.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-api-handlers-webhook", label: "handlers/webhook.rs", type: "api", description: "rust/hook-api/src/handlers/webhook.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-worker-main", label: "worker/main.rs", type: "api", description: "rust/hook-worker/src/main.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-worker-lib", label: "worker/lib.rs", type: "api", description: "rust/hook-worker/src/lib.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-worker-config", label: "worker/config.rs", type: "api", description: "rust/hook-worker/src/config.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-worker-error", label: "worker/error.rs", type: "api", description: "rust/hook-worker/src/error.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-worker-util", label: "worker/util.rs", type: "api", description: "rust/hook-worker/src/util.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-worker-worker", label: "worker/worker.rs", type: "api", description: "rust/hook-worker/src/worker.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-janitor-main", label: "janitor/main.rs", type: "api", description: "rust/hook-janitor/src/main.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-janitor-config", label: "janitor/config.rs", type: "api", description: "rust/hook-janitor/src/config.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-janitor-cleanup", label: "janitor/cleanup.rs", type: "api", description: "rust/hook-janitor/src/cleanup.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-janitor-webhooks", label: "janitor/webhooks.rs", type: "api", description: "rust/hook-janitor/src/webhooks.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-janitor-handlers-mod", label: "janitor/handlers/mod.rs", type: "api", description: "rust/hook-janitor/src/handlers/mod.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-janitor-handlers-app", label: "janitor/handlers/app.rs", type: "api", description: "rust/hook-janitor/src/handlers/app.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-janitor-sql1", label: "janitor/hoghook_cleanup.sql", type: "api", description: "rust/hook-janitor/src/fixtures/hoghook_cleanup.sql", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-janitor-sql2", label: "janitor/webhook_cleanup.sql", type: "api", description: "rust/hook-janitor/src/fixtures/webhook_cleanup.sql", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-common-lib", label: "common/lib.rs", type: "api", description: "rust/hook-common/src/lib.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-common-pgqueue", label: "common/pgqueue.rs", type: "api", description: "rust/hook-common/src/pgqueue.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-common-retry", label: "common/retry.rs", type: "api", description: "rust/hook-common/src/retry.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },
  { id: "file-mod-rust-hooks-common-webhook", label: "common/webhook.rs", type: "api", description: "rust/hook-common/src/webhook.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-hooks" },

  // ===== mod-rust-property-defs (18 files) — individual file listing =====
  { id: "file-mod-rust-propdefs-main", label: "main.rs", type: "data", description: "rust/property-defs-rs/src/main.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-lib", label: "lib.rs", type: "data", description: "rust/property-defs-rs/src/lib.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-config", label: "config.rs", type: "data", description: "rust/property-defs-rs/src/config.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-app-context", label: "app_context.rs", type: "data", description: "rust/property-defs-rs/src/app_context.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-batch-ingestion", label: "batch_ingestion.rs", type: "data", description: "rust/property-defs-rs/src/batch_ingestion.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-measuring-channel", label: "measuring_channel.rs", type: "data", description: "rust/property-defs-rs/src/measuring_channel.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-metrics-consts", label: "metrics_consts.rs", type: "data", description: "rust/property-defs-rs/src/metrics_consts.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-types", label: "types.rs", type: "data", description: "rust/property-defs-rs/src/types.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-update-cache", label: "update_cache.rs", type: "data", description: "rust/property-defs-rs/src/update_cache.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-api-mod", label: "api/mod.rs", type: "data", description: "rust/property-defs-rs/src/api/mod.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-api-constants", label: "api/v1/constants.rs", type: "data", description: "rust/property-defs-rs/src/api/v1/constants.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-api-errors", label: "api/v1/errors.rs", type: "data", description: "rust/property-defs-rs/src/api/v1/errors.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-api-query", label: "api/v1/query.rs", type: "data", description: "rust/property-defs-rs/src/api/v1/query.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-api-routing", label: "api/v1/routing.rs", type: "data", description: "rust/property-defs-rs/src/api/v1/routing.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-test-batch", label: "tests/batch_ingestion.rs", type: "data", description: "rust/property-defs-rs/tests/batch_ingestion.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-test-queries", label: "tests/queries.rs", type: "data", description: "rust/property-defs-rs/tests/queries.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-test-types", label: "tests/types.rs", type: "data", description: "rust/property-defs-rs/tests/types.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },
  { id: "file-mod-rust-propdefs-test-cache", label: "tests/update_cache.rs", type: "data", description: "rust/property-defs-rs/tests/update_cache.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-property-defs" },

  // ===== mod-livestream-core (29 files) — individual file listing =====
  { id: "file-mod-livestream-main", label: "main.go", type: "api", description: "livestream/main.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-main-test", label: "main_test.go", type: "api", description: "livestream/main_test.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-auth-jwt", label: "auth/jwt.go", type: "api", description: "livestream/auth/jwt.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-auth-jwt-test", label: "auth/jwt_test.go", type: "api", description: "livestream/auth/jwt_test.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-configs", label: "configs/configs.go", type: "api", description: "livestream/configs/configs.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-configs-test", label: "configs/configs_test.go", type: "api", description: "livestream/configs/configs_test.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-filter", label: "events/filter.go", type: "api", description: "livestream/events/filter.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-filter-ej", label: "events/filter_easyjson.go", type: "api", description: "livestream/events/filter_easyjson.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-filter-test", label: "events/filter_test.go", type: "api", description: "livestream/events/filter_test.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-kafka", label: "events/kafka.go", type: "api", description: "livestream/events/kafka.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-kafka-ej", label: "events/kafka_easyjson.go", type: "api", description: "livestream/events/kafka_easyjson.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-kafka-test", label: "events/kafka_test.go", type: "api", description: "livestream/events/kafka_test.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-live-stats", label: "events/live_stats.go", type: "api", description: "livestream/events/live_stats.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-sr-consumer", label: "events/session_recording_consumer.go", type: "api", description: "livestream/events/session_recording_consumer.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-sr-consumer-test", label: "events/session_recording_consumer_test.go", type: "api", description: "livestream/events/session_recording_consumer_test.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-session-stats", label: "events/session_stats.go", type: "api", description: "livestream/events/session_stats.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-session-stats-test", label: "events/session_stats_test.go", type: "api", description: "livestream/events/session_stats_test.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-ttl", label: "events/ttl_counter.go", type: "api", description: "livestream/events/ttl_counter.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-events-ttl-test", label: "events/ttl_counter_test.go", type: "api", description: "livestream/events/ttl_counter_test.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-geo", label: "geo/geoip.go", type: "api", description: "livestream/geo/geoip.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-geo-test", label: "geo/geoip_test.go", type: "api", description: "livestream/geo/geoip_test.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-handlers-event", label: "handlers/event.go", type: "api", description: "livestream/handlers/event.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-handlers-event-test", label: "handlers/event_test.go", type: "api", description: "livestream/handlers/event_test.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-handlers-handlers", label: "handlers/handlers.go", type: "api", description: "livestream/handlers/handlers.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-handlers-handlers-test", label: "handlers/handlers_test.go", type: "api", description: "livestream/handlers/handlers_test.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-metrics", label: "metrics/metrics.go", type: "api", description: "livestream/metrics/metrics.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-mocks-geolocator", label: "mocks/GeoLocator.go", type: "api", description: "livestream/mocks/GeoLocator.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-mocks-kafka-consumer", label: "mocks/KafkaConsumer.go", type: "api", description: "livestream/mocks/KafkaConsumer.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },
  { id: "file-mod-livestream-mocks-kafka-interface", label: "mocks/KafkaConsumerInterface.go", type: "api", description: "livestream/mocks/KafkaConsumerInterface.go", stats: "", level: "file", group: "livestream", parentId: "mod-livestream-core" },

  // ===== mod-rust-cyclotron (22 files) — individual file listing =====
  { id: "file-mod-rust-cyclotron-core-lib", label: "core/lib.rs", type: "utility", description: "rust/cyclotron-core/src/lib.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-core-config", label: "core/config.rs", type: "utility", description: "rust/cyclotron-core/src/config.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-core-error", label: "core/error.rs", type: "utility", description: "rust/cyclotron-core/src/error.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-core-janitor", label: "core/janitor.rs", type: "utility", description: "rust/cyclotron-core/src/janitor.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-core-manager", label: "core/manager.rs", type: "utility", description: "rust/cyclotron-core/src/manager.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-core-types", label: "core/types.rs", type: "utility", description: "rust/cyclotron-core/src/types.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-core-worker", label: "core/worker.rs", type: "utility", description: "rust/cyclotron-core/src/worker.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-ops-mod", label: "core/ops/mod.rs", type: "utility", description: "rust/cyclotron-core/src/ops/mod.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-ops-compress", label: "core/ops/compress.rs", type: "utility", description: "rust/cyclotron-core/src/ops/compress.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-ops-janitor", label: "core/ops/janitor.rs", type: "utility", description: "rust/cyclotron-core/src/ops/janitor.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-ops-manager", label: "core/ops/manager.rs", type: "utility", description: "rust/cyclotron-core/src/ops/manager.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-ops-meta", label: "core/ops/meta.rs", type: "utility", description: "rust/cyclotron-core/src/ops/meta.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-ops-worker", label: "core/ops/worker.rs", type: "utility", description: "rust/cyclotron-core/src/ops/worker.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-tests-base", label: "core/tests/base_ops.rs", type: "utility", description: "rust/cyclotron-core/tests/base_ops.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-tests-common", label: "core/tests/common.rs", type: "utility", description: "rust/cyclotron-core/tests/common.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-tests-shard", label: "core/tests/shard.rs", type: "utility", description: "rust/cyclotron-core/tests/shard.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-janitor-main", label: "janitor/main.rs", type: "utility", description: "rust/cyclotron-janitor/src/main.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-janitor-lib", label: "janitor/lib.rs", type: "utility", description: "rust/cyclotron-janitor/src/lib.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-janitor-config", label: "janitor/config.rs", type: "utility", description: "rust/cyclotron-janitor/src/config.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-janitor-janitor", label: "janitor/janitor.rs", type: "utility", description: "rust/cyclotron-janitor/src/janitor.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-janitor-metrics", label: "janitor/metrics_constants.rs", type: "utility", description: "rust/cyclotron-janitor/src/metrics_constants.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
  { id: "file-mod-rust-cyclotron-janitor-test", label: "janitor/tests/janitor.rs", type: "utility", description: "rust/cyclotron-janitor/tests/janitor.rs", stats: "", level: "file", group: "rust-services", parentId: "mod-rust-cyclotron" },
];

// No edges at L4 — this is intentional. Dependency edges require SCIP-based
// static analysis to generate accurately. The absence of edges here demonstrates
// why automated tooling is necessary for the L4→L5 transition.
export const fileEdges: GraphEdge[] = [];

// ============================================================
// GROUP DEFINITIONS
// ============================================================

// PostHog groups
const posthogGroups: { id: SystemGroup; label: string; color: string }[] = [
  { id: "web-app", label: "Django Backend", color: "hsl(var(--node-api))" },
  { id: "frontend", label: "React Frontend", color: "hsl(var(--node-component))" },
  { id: "plugin-server", label: "Node.js Event Engine", color: "hsl(var(--node-utility))" },
  { id: "workers", label: "Celery Workers", color: "hsl(var(--node-config))" },
  { id: "temporal", label: "Temporal Workers", color: "hsl(var(--node-problem))" },
  { id: "rust-services", label: "Rust Services", color: "hsl(var(--node-rust))" },
  { id: "infrastructure", label: "Infrastructure", color: "hsl(var(--node-data))" },
  { id: "livestream", label: "Livestream (Go)", color: "hsl(var(--node-external))" },
];

// Daytona groups
const daytonaGroups: { id: SystemGroup; label: string; color: string }[] = [
  { id: "d-api", label: "NestJS API Server", color: "hsl(var(--node-api))" },
  { id: "d-dashboard", label: "React Dashboard", color: "hsl(var(--node-component))" },
  { id: "d-runner", label: "Runner (Go)", color: "hsl(var(--node-utility))" },
  { id: "d-daemon", label: "Daemon / Toolbox (Go)", color: "hsl(var(--node-config))" },
  { id: "d-cli", label: "CLI (Go)", color: "hsl(var(--node-problem))" },
  { id: "d-gateway", label: "Proxy & Gateway (Go)", color: "hsl(var(--node-rust))" },
  { id: "d-sdks", label: "Multi-Language SDKs", color: "hsl(var(--node-external))" },
  { id: "d-infra", label: "Infrastructure", color: "hsl(var(--node-data))" },
];

export const systemGroups: { id: SystemGroup; label: string; color: string }[] = posthogGroups;

export function getSystemGroupsForRepo(repoId?: string): { id: SystemGroup; label: string; color: string }[] {
  if (repoId === "daytona") return daytonaGroups;
  return posthogGroups;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Daytona data imports
import {
  daytonaContextNodes, daytonaContextEdges,
  daytonaSystemNodes, daytonaSystemEdges,
  daytonaModuleNodes, daytonaModuleEdges,
  daytonaFileNodes, daytonaFileEdges,
} from "./demoDataDaytona";

export function getNodesForLevel(level: ZoomLevel, repoId?: string): GraphNode[] {
  if (repoId === "daytona") {
    if (level === "context") return daytonaContextNodes;
    if (level === "system") return daytonaSystemNodes;
    if (level === "file") return daytonaFileNodes;
    return daytonaModuleNodes;
  }
  if (level === "context") return contextNodes;
  if (level === "system") return systemNodes;
  if (level === "file") return fileNodes;
  return moduleNodes;
}

export function getEdgesForLevel(level: ZoomLevel, repoId?: string): GraphEdge[] {
  if (repoId === "daytona") {
    if (level === "context") return daytonaContextEdges;
    if (level === "system") return daytonaSystemEdges;
    if (level === "file") return daytonaFileEdges;
    return daytonaModuleEdges;
  }
  if (level === "context") return contextEdges;
  if (level === "system") return systemEdges;
  if (level === "file") return fileEdges;
  return moduleEdges;
}

export function getNodesGroupedBySystem(nodes: GraphNode[], repoId?: string): Map<SystemGroup, GraphNode[]> {
  const grouped = new Map<SystemGroup, GraphNode[]>();
  const groups = getSystemGroupsForRepo(repoId);

  for (const group of groups) {
    grouped.set(group.id, []);
  }

  for (const node of nodes) {
    if (node.group) {
      const groupNodes = grouped.get(node.group) || [];
      groupNodes.push(node);
      grouped.set(node.group, groupNodes);
    }
  }

  return grouped;
}
