// ksync mapping based on main branch (2026-02)
// https://github.com/ksync/ksync
// ksync codebase visualization — mapped by Legend

import type { GraphNode, GraphEdge } from "./demoData";

// ============================================================
// L1 — CONTEXT LEVEL
// ============================================================

export const ksyncContextNodes: GraphNode[] = [
  {
    id: "ksync-system",
    label: "ksync",
    type: "component",
    description: "Syncs local files to containers running in Kubernetes. Developers edit code locally and it appears instantly in their cluster pods — no image rebuilds, no kubectl cp. Uses syncthing under the hood for fast, bidirectional file transfer through port-forwarded tunnels.",
    stats: "Go 100% • ~7,400 lines • 1.5k stars",
    level: "context",
    purpose: "ksync eliminates the inner-loop rebuild cycle for Kubernetes development. Edit code locally, see it running in your cluster in seconds.",
  },
  // Actors
  {
    id: "k-actor-developers",
    label: "Developers",
    type: "actor",
    description: "Software engineers developing applications that run on Kubernetes. They edit source code locally and need it synced into running containers without rebuilding images or restarting deployments.",
    stats: "Primary users",
    level: "context",
  },
  {
    id: "k-actor-devops",
    label: "DevOps / Platform Engineers",
    type: "actor",
    description: "Engineers who deploy and manage the ksync DaemonSet on cluster nodes. Run 'ksync init' to install the remote component and ensure the cluster meets prerequisites (Docker overlay2, K8s 1.7+).",
    stats: "Cluster operators",
    level: "context",
  },
  // External systems
  {
    id: "k-ext-kubernetes",
    label: "Kubernetes API",
    type: "external",
    description: "Kubernetes API server watched by ksync for pod events. When pods matching a sync spec start or stop, ksync reacts by creating or tearing down file sync sessions. Also used for port-forwarding tunnels via SPDY.",
    stats: "k8s.io/client-go • v1.7+",
    level: "context",
  },
  {
    id: "k-ext-docker",
    label: "Docker Daemon",
    type: "external",
    description: "Docker daemon running on each cluster node. Queried by radar to resolve container filesystem paths (overlay2 MergedDir) and to restart containers for hot-reload after file syncs complete.",
    stats: "Docker API ≥1.25 • overlay2 driver",
    level: "context",
  },
  {
    id: "k-ext-local-fs",
    label: "Local Filesystem",
    type: "external",
    description: "Developer's local machine filesystem. The source side of the sync — ksync watches a local directory and pushes changes to the matched container in the cluster.",
    stats: "Developer workstation",
    level: "context",
  },
  {
    id: "k-ext-container-fs",
    label: "Container Filesystems",
    type: "external",
    description: "Filesystem inside running Kubernetes containers. The target side of the sync — files are written to the container's overlay2 merged directory via syncthing running on the same node.",
    stats: "/var/lib/docker/overlay2/.../merged",
    level: "context",
  },
  {
    id: "k-ext-syncthing-upstream",
    label: "Syncthing Project",
    type: "external",
    description: "Open-source continuous file synchronization tool. ksync embeds syncthing as its file transfer engine — it downloads the binary on init and orchestrates local and remote instances to move files through encrypted tunnels.",
    stats: "syncthing/syncthing • 60k+ stars",
    level: "context",
  },
];

export const ksyncContextEdges: GraphEdge[] = [
  { id: "k-ctx-e1", source: "k-actor-developers", target: "ksync-system", type: "call", label: "Create sync specs & watch" },
  { id: "k-ctx-e2", source: "k-actor-devops", target: "ksync-system", type: "call", label: "Deploy DaemonSet (ksync init)" },
  { id: "k-ctx-e3", source: "ksync-system", target: "k-ext-kubernetes", type: "call", label: "Watch pods & port-forward" },
  { id: "k-ctx-e4", source: "ksync-system", target: "k-ext-docker", type: "call", label: "Resolve paths & restart" },
  { id: "k-ctx-e5", source: "ksync-system", target: "k-ext-local-fs", type: "data", label: "Read local files" },
  { id: "k-ctx-e6", source: "ksync-system", target: "k-ext-container-fs", type: "data", label: "Write to container" },
  { id: "k-ctx-e7", source: "ksync-system", target: "k-ext-syncthing-upstream", type: "import", label: "Embedded file sync engine" },
];

// ============================================================
// L2 — SYSTEM / CONTAINER LEVEL
// ============================================================

export const ksyncSystemNodes: GraphNode[] = [
  {
    id: "k-cli-app",
    label: "CLI Application",
    type: "api",
    description: "Local Go binary providing all user-facing commands: init (bootstrap cluster), create/delete (manage sync specs), get (show status), watch (start daemon), doctor (diagnostics), clean (teardown), reload (hot-reload), update (self-update), and version.",
    stats: "Go • Cobra • 14 files • ~1,480 lines",
    level: "system",
    architecture: "Cobra CLI with 11 subcommands. Each command initializes the Kubernetes client, reads/writes the YAML config at ~/.ksync/ksync.yaml, and communicates with the watch daemon via local gRPC. Supports daemonized background mode via go-daemon.",
    technicalSpecs: [
      { title: "Framework", details: "spf13/cobra + spf13/viper for config" },
      { title: "Commands", details: "init, create, delete, get, watch, doctor, clean, reload, update, version" },
      { title: "Config", details: "~/.ksync/ksync.yaml — YAML spec list + settings" },
      { title: "Daemon", details: "go-daemon for background watch process with PID file" },
    ],
    connections: {
      inputs: [],
      outputs: [
        { name: "Watch Service", id: "k-watch" },
        { name: "Kubernetes API", id: "k-ext-kubernetes" },
      ],
    },
    dependencies: {
      external: ["spf13/cobra", "spf13/viper", "sevlyar/go-daemon"],
      internal: ["cmd/ksync"],
    },
  },
  {
    id: "k-watch",
    label: "Watch Service",
    type: "utility",
    description: "The main workhorse of ksync. Loads sync specs from config, watches the Kubernetes API for matching pods, manages the local syncthing process, creates port-forwarded tunnels to cluster pods, configures syncthing device/folder pairs, monitors sync events, and triggers hot-reloads. Exposes a local gRPC server for status queries.",
    stats: "Go • ~2,600 lines across pkg/ksync/",
    level: "system",
    architecture: "Event-driven orchestration loop. SpecList reads specs from config via viper and reconciles on updates. Each Spec watches K8s API for pod events matching its selector. When a pod appears, a Service+Folder is created that sets up tunnels, configures syncthing, and monitors events. The gRPC server lets 'get' and 'reload' commands query/control the running state.",
    technicalSpecs: [
      { title: "Core Loop", details: "SpecList → Spec(SpecDetails) → ServiceList → Service(RemoteContainer) → Folder" },
      { title: "K8s Watch", details: "k8s.io/client-go watch API for pod create/delete events" },
      { title: "gRPC Server", details: "Local server on port 40322 for get/reload commands" },
      { title: "Config Watch", details: "viper watches ~/.ksync/ksync.yaml — SpecList.Update() reconciles on change" },
    ],
    connections: {
      inputs: [{ name: "CLI Application", id: "k-cli-app" }],
      outputs: [
        { name: "Syncthing (Local)", id: "k-syncthing-local" },
        { name: "Radar (Remote)", id: "k-radar" },
        { name: "Kubernetes API", id: "k-ext-kubernetes" },
      ],
    },
    dependencies: {
      external: ["k8s.io/client-go", "google.golang.org/grpc", "spf13/viper"],
      internal: ["pkg/ksync"],
    },
  },
  {
    id: "k-syncthing-local",
    label: "Syncthing (Local)",
    type: "component",
    description: "Embedded syncthing process managed by ksync on the developer's machine. Downloaded on 'ksync init', started by the watch daemon, and configured via its REST API. Handles the actual bidirectional file transfer to the remote syncthing instance through port-forwarded tunnels.",
    stats: "Go • 7 files • ~500 lines (management code)",
    level: "system",
    architecture: "ksync downloads the syncthing binary, resets its config (disabling discovery/relay/NAT since all connections go through kubectl tunnels), starts it as a child process, and uses the REST API to configure devices and folders. Events from syncthing drive status updates and hot-reload triggers.",
    technicalSpecs: [
      { title: "Binary", details: "Downloaded from syncthing/syncthing GitHub releases" },
      { title: "API", details: "REST API on localhost:8384 with API key 'ksync'" },
      { title: "Config", details: "Discovery/relay/NAT disabled — all traffic through K8s tunnels" },
      { title: "Events", details: "FolderSummary + FolderCompletion events drive status updates" },
    ],
    connections: {
      inputs: [{ name: "Watch Service", id: "k-watch" }],
      outputs: [{ name: "Syncthing (Remote)", id: "k-syncthing-remote" }],
    },
    dependencies: {
      external: ["syncthing/syncthing", "gopkg.in/resty.v1"],
      internal: ["pkg/syncthing"],
    },
  },
  {
    id: "k-radar",
    label: "Radar (Remote)",
    type: "config",
    description: "gRPC server running as a container in the ksync DaemonSet on every cluster node. Queries the Docker daemon to resolve container overlay2 filesystem paths and issues container restart commands for hot-reload and syncthing mount refresh.",
    stats: "Go • 6 files • ~330 lines",
    level: "system",
    architecture: "Gin-less gRPC server with protobuf-defined service. Runs as the 'radar' container in the ksync DaemonSet, with access to the Docker socket (/var/run/docker.sock). Handles GetBasePath (resolve container → host path), RestartSyncthing (refresh mounts), Restart (hot-reload user container), and version/docker info endpoints.",
    technicalSpecs: [
      { title: "Transport", details: "gRPC on port 40321 with optional TLS" },
      { title: "Docker Access", details: "Docker SDK via /var/run/docker.sock mount" },
      { title: "RPCs", details: "GetBasePath, RestartSyncthing, Restart, GetVersionInfo, GetDockerVersion, GetDockerInfo" },
      { title: "Deployment", details: "DaemonSet container alongside remote syncthing" },
    ],
    connections: {
      inputs: [{ name: "Watch Service", id: "k-watch" }],
      outputs: [{ name: "Docker Daemon", id: "k-ext-docker" }],
    },
    dependencies: {
      external: ["google.golang.org/grpc", "docker/docker"],
      internal: ["pkg/radar", "cmd/radar"],
    },
  },
  {
    id: "k-syncthing-remote",
    label: "Syncthing (Remote)",
    type: "component",
    description: "Syncthing instance running as the second container in the ksync DaemonSet on each cluster node. Configured by ksync (via tunneled API calls) to sync files with the local syncthing. Has access to the Docker storage root (/var/lib/docker) to write files directly into container overlay2 filesystems.",
    stats: "Syncthing binary • Alpine container",
    level: "system",
    architecture: "Standard syncthing binary running in a container with discovery/relay/NAT disabled. Mounted volumes give it access to /var/lib/docker (container filesystems) and /var/lib/kubelet (pod volumes). API exposed on port 8384, listener on port 22000.",
    technicalSpecs: [
      { title: "Ports", details: "8384 (API) + 22000 (sync listener)" },
      { title: "Mounts", details: "/var/lib/docker + /var/lib/kubelet for container filesystem access" },
      { title: "Config", details: "Discovery/relay/NAT disabled — peers via ksync-managed tunnels only" },
    ],
    connections: {
      inputs: [{ name: "Syncthing (Local)", id: "k-syncthing-local" }],
      outputs: [{ name: "Container Filesystems", id: "k-ext-container-fs" }],
    },
    dependencies: {
      external: ["syncthing/syncthing"],
      internal: ["docker/"],
    },
  },
  {
    id: "k-k8s-api",
    label: "Kubernetes API",
    type: "data",
    description: "Kubernetes API server. ksync uses client-go to watch for pod events matching sync spec selectors, create port-forward tunnels (SPDY) to DaemonSet pods, and manage the DaemonSet deployment itself (create, upgrade, delete).",
    stats: "k8s.io/client-go • SPDY tunnels",
    level: "system",
    architecture: "Standard Kubernetes API interactions via client-go. Watches are set up per-spec to monitor matching pods. Port-forwarding uses the SPDY transport through the API server to tunnel gRPC and syncthing traffic to DaemonSet pods.",
    technicalSpecs: [
      { title: "Client", details: "k8s.io/client-go from kubeconfig" },
      { title: "Watch", details: "Pod watch with label/field selectors per sync spec" },
      { title: "Tunnels", details: "SPDY-based port-forward for radar (40321), syncthing API (8384), syncthing listener (22000)" },
      { title: "Resources", details: "DaemonSet, ServiceAccount, PSP, ClusterRole, ClusterRoleBinding" },
    ],
    connections: {
      inputs: [
        { name: "Watch Service", id: "k-watch" },
        { name: "CLI Application", id: "k-cli-app" },
      ],
      outputs: [],
    },
    dependencies: {
      external: ["k8s.io/client-go", "k8s.io/api", "k8s.io/apimachinery"],
      internal: [],
    },
  },
];

export const ksyncSystemEdges: GraphEdge[] = [
  // CLI → Watch (gRPC)
  { id: "k-se-1", source: "k-cli-app", target: "k-watch", type: "call", label: "gRPC: get specs, reload" },

  // CLI → K8s API (init, clean, doctor)
  { id: "k-se-2", source: "k-cli-app", target: "k-k8s-api", type: "call", label: "Deploy DaemonSet" },

  // Watch → K8s API (watch pods, port-forward)
  { id: "k-se-3", source: "k-watch", target: "k-k8s-api", type: "call", label: "Watch pods & tunnel" },

  // Watch → Syncthing Local (manage process)
  { id: "k-se-4", source: "k-watch", target: "k-syncthing-local", type: "call", label: "Start/configure/monitor" },

  // Watch → Radar (via tunnel through K8s API)
  { id: "k-se-5", source: "k-watch", target: "k-radar", type: "call", label: "gRPC: resolve path, restart" },

  // Syncthing Local ↔ Syncthing Remote (file sync)
  { id: "k-se-6", source: "k-syncthing-local", target: "k-syncthing-remote", type: "data", label: "Bidirectional file sync" },

  // Radar → Docker (query container paths + restart)
  { id: "k-se-7", source: "k-radar", target: "k-syncthing-remote", type: "call", label: "Restart syncthing sidecar" },
];

// ============================================================
// L3 — MODULE / COMPONENT LEVEL
// ============================================================

export const ksyncModuleNodes: GraphNode[] = [
  // ===== CLI GROUP =====
  {
    id: "k-mod-cli-commands",
    label: "CLI Commands",
    type: "api",
    description: "Cobra subcommand definitions for all 11 ksync commands: init, create, delete, get, watch, doctor, clean, reload, update, version, and the root command with global flags (namespace, context, port, image, apikey).",
    stats: "cmd/ksync/ • 14 files • 1,482 lines",
    level: "module",
    group: "k-cli",
    purpose: "Entry point for all user interaction. Each command reads config, initializes the K8s client, and delegates to core packages.",
    howItWorks: {
      overview: "Cobra CLI tree with global persistent flags and per-command logic.",
      workflow: [
        { step: 1, description: "Root command registers all subcommands and initializes K8s client via PersistentPreRunE" },
        { step: 2, description: "Each subcommand parses flags, validates input, and calls into pkg/ksync or pkg/cli" },
        { step: 3, description: "'watch' starts the daemon loop; 'get' connects via gRPC; 'create/delete' modify config" },
      ],
    },
    connections: {
      inputs: [],
      outputs: [
        { name: "Core Orchestration", id: "k-mod-core" },
        { name: "CLI Utilities", id: "k-mod-cli-utils" },
        { name: "Cluster Management", id: "k-mod-cluster" },
      ],
    },
    dependencies: {
      external: ["spf13/cobra", "spf13/viper", "sevlyar/go-daemon", "jpillora/overseer"],
      internal: ["cmd/ksync"],
    },
  },
  {
    id: "k-mod-cli-utils",
    label: "CLI Utilities",
    type: "config",
    description: "Shared CLI infrastructure: BaseCmd struct for flag binding, config file management (~/.ksync/), FinderCmd for container targeting flags (--pod, --selector, --container), task output with spinners, and logging setup.",
    stats: "pkg/cli/ • 7 files • 258 lines",
    level: "module",
    group: "k-cli",
    connections: {
      inputs: [{ name: "CLI Commands", id: "k-mod-cli-commands" }],
      outputs: [],
    },
    dependencies: {
      external: ["spf13/viper", "briandowns/spinner", "sirupsen/logrus"],
      internal: [],
    },
  },
  {
    id: "k-mod-input",
    label: "Input Handling",
    type: "config",
    description: "User input parsing and validation. SyncPath type parses and validates local/remote path pairs from command line arguments. Ensures both paths are absolute and local paths exist with correct permissions.",
    stats: "pkg/input/ • 2 files • 87 lines",
    level: "module",
    group: "k-cli",
    connections: {
      inputs: [{ name: "CLI Commands", id: "k-mod-cli-commands" }],
      outputs: [],
    },
    dependencies: {
      external: ["phayes/permbits"],
      internal: [],
    },
  },
  {
    id: "k-mod-debug",
    label: "Debug Utilities",
    type: "config",
    description: "Debug and logging helpers: MergeFields combines logrus field maps, YamlString serializes structs for debug output, StructFields converts structs to log fields, ErrorOut wraps errors with file/line location.",
    stats: "pkg/debug/ • 2 files • 67 lines",
    level: "module",
    group: "k-cli",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: ["sirupsen/logrus", "fatih/structs"],
      internal: [],
    },
  },

  // ===== WATCH / CORE GROUP =====
  {
    id: "k-mod-core",
    label: "Core Orchestration",
    type: "utility",
    description: "The heart of ksync. Contains the object hierarchy that drives file syncing: SpecList (canonical spec collection from config), Spec (watches K8s for matching pods), SpecDetails (sync configuration), ServiceList (manages per-pod services), Service (active sync session), RemoteContainer (remote pod identity), and Folder (bulk orchestration — tunnels, syncthing config, event monitoring, hot-reload).",
    stats: "pkg/ksync/ • 12 files • 1,684 lines",
    level: "module",
    group: "k-core",
    purpose: "Orchestrates the entire sync lifecycle from config to running file synchronization.",
    howItWorks: {
      overview: "SpecList → Spec(SpecDetails) → ServiceList → Service(RemoteContainer) → Folder",
      workflow: [
        { step: 1, description: "SpecList deserializes sync specs from ~/.ksync/ksync.yaml and watches for config file changes" },
        { step: 2, description: "Each Spec watches the K8s API for pods matching its selector/pod name" },
        { step: 3, description: "When a matching pod starts, a Service is created with a RemoteContainer referencing the specific container" },
        { step: 4, description: "The Service's Folder connects to radar (via tunnel) to resolve the container's host filesystem path" },
        { step: 5, description: "Folder creates tunnels for syncthing API + listener ports, configures device IDs and folders on both sides" },
        { step: 6, description: "Syncthing begins bidirectional file sync; Folder monitors events for completion and triggers hot-reload" },
      ],
    },
    connections: {
      inputs: [{ name: "CLI Commands", id: "k-mod-cli-commands" }],
      outputs: [
        { name: "Syncthing Manager", id: "k-mod-syncthing" },
        { name: "Cluster Management", id: "k-mod-cluster" },
        { name: "Radar Client", id: "k-mod-radar-client" },
        { name: "Local gRPC Server", id: "k-mod-server" },
      ],
    },
    dependencies: {
      external: ["spf13/viper", "cenkalti/backoff", "imdario/mergo", "golang/protobuf"],
      internal: ["pkg/ksync"],
    },
  },
  {
    id: "k-mod-server",
    label: "Local gRPC Server",
    type: "api",
    description: "gRPC server started by the watch daemon on localhost:40322. Implements the Ksync protobuf service: GetSpecList (returns current spec/service state for 'get' command), RestartSyncthing (restart local syncthing process), and IsAlive (health check). Uses logrus gRPC middleware.",
    stats: "pkg/ksync/server/ • 4 files • 167 lines",
    level: "module",
    group: "k-core",
    connections: {
      inputs: [{ name: "CLI Commands", id: "k-mod-cli-commands" }],
      outputs: [{ name: "Core Orchestration", id: "k-mod-core" }],
    },
    dependencies: {
      external: ["google.golang.org/grpc", "grpc-ecosystem/go-grpc-middleware"],
      internal: [],
    },
  },
  {
    id: "k-mod-doctor",
    label: "Doctor Checks",
    type: "utility",
    description: "12 diagnostic checks for troubleshooting: syncthing binary exists, cluster config valid, cluster connection, K8s version ≥1.7, cluster permissions (DaemonSet, port-forward), DaemonSet installed, all nodes healthy, version match, Docker API ≥1.25, Docker overlay2 driver, Docker graph root, watch daemon running.",
    stats: "pkg/ksync/doctor/ • 7 files • 519 lines",
    level: "module",
    group: "k-core",
    purpose: "Comprehensive pre-flight and post-flight diagnostics to catch misconfiguration before it causes cryptic failures.",
    howItWorks: {
      overview: "Ordered check list with typed checks (pre-init vs post-init).",
      workflow: [
        { step: 1, description: "Iterates through CheckList of 12 named checks" },
        { step: 2, description: "Each check returns pass/fail with a message" },
        { step: 3, description: "Doctor renders results with spinners, green checkmarks, and red X marks" },
      ],
    },
    connections: {
      inputs: [{ name: "CLI Commands", id: "k-mod-cli-commands" }],
      outputs: [
        { name: "Cluster Management", id: "k-mod-cluster" },
        { name: "Radar Client", id: "k-mod-radar-client" },
      ],
    },
    dependencies: {
      external: ["blang/semver"],
      internal: [],
    },
  },

  // ===== CLUSTER GROUP =====
  {
    id: "k-mod-cluster",
    label: "Cluster Management",
    type: "utility",
    description: "Kubernetes cluster interaction layer. Manages the K8s client singleton, DaemonSet deployment (with ServiceAccount, PSP, ClusterRole, ClusterRoleBinding), SPDY-based port-forward tunnels to DaemonSet pods, and health checking. The Connection type manages tunneled access to a specific node's radar and syncthing.",
    stats: "pkg/ksync/cluster/ • 7 files • 918 lines",
    level: "module",
    group: "k-core",
    purpose: "Abstracts all Kubernetes API interactions — deployment, tunneling, health monitoring.",
    howItWorks: {
      overview: "K8s client-go wrapper with tunnel management and DaemonSet lifecycle.",
      workflow: [
        { step: 1, description: "InitKubeClient() creates a singleton K8s client from kubeconfig" },
        { step: 2, description: "cluster.Service manages DaemonSet CRUD (Run, Remove, IsInstalled, IsHealthy)" },
        { step: 3, description: "Connection creates per-node tunnels: radar gRPC (40321), syncthing API (8384), syncthing listener (22000)" },
        { step: 4, description: "Tunnel uses SPDY transport through K8s API server for port forwarding" },
      ],
    },
    connections: {
      inputs: [{ name: "Core Orchestration", id: "k-mod-core" }],
      outputs: [],
    },
    dependencies: {
      external: ["k8s.io/client-go", "k8s.io/api", "k8s.io/apimachinery"],
      internal: [],
    },
  },

  // ===== SYNCTHING GROUP =====
  {
    id: "k-mod-syncthing",
    label: "Syncthing Manager",
    type: "component",
    description: "Manages the local syncthing process lifecycle and its REST API. Downloads the syncthing binary from GitHub releases, resets config (disabling discovery/relay/NAT), starts the process, and provides a REST API client for configuring devices (peer pairing), folders (sync targets), monitoring events (completion, errors), and restart/stop control.",
    stats: "pkg/syncthing/ • 7 files • 499 lines",
    level: "module",
    group: "k-syncthing",
    purpose: "Wraps syncthing into a managed subprocess that ksync can fully control through its REST API.",
    howItWorks: {
      overview: "Process lifecycle manager + REST API client for syncthing.",
      workflow: [
        { step: 1, description: "Fetch() downloads syncthing binary from GitHub releases (platform-specific archive)" },
        { step: 2, description: "ResetConfig() writes default XML config with discovery/relay disabled" },
        { step: 3, description: "Run() starts syncthing as child process with correct flags, captures stdout/stderr" },
        { step: 4, description: "Server REST client configures devices (SetDevice), folders (SetFolder), and polls Events()" },
        { step: 5, description: "Events channel drives Folder status updates and hot-reload triggers" },
      ],
    },
    connections: {
      inputs: [{ name: "Core Orchestration", id: "k-mod-core" }],
      outputs: [],
    },
    dependencies: {
      external: ["syncthing/syncthing", "gopkg.in/resty.v1"],
      internal: [],
    },
  },

  // ===== RADAR GROUP =====
  {
    id: "k-mod-radar-client",
    label: "Radar gRPC Client",
    type: "utility",
    description: "Client-side code used by the watch service to call radar's gRPC endpoints. Part of the Folder's setup — connects to radar via a port-forwarded tunnel to resolve the container filesystem path before configuring syncthing.",
    stats: "Used in pkg/ksync/folder.go • via generated proto stubs",
    level: "module",
    group: "k-radar",
    connections: {
      inputs: [{ name: "Core Orchestration", id: "k-mod-core" }],
      outputs: [{ name: "Radar Server", id: "k-mod-radar-server" }],
    },
    dependencies: {
      external: ["google.golang.org/grpc"],
      internal: ["pkg/proto"],
    },
  },
  {
    id: "k-mod-radar-server",
    label: "Radar Server",
    type: "api",
    description: "gRPC server implementation for the radar service running inside each cluster node's DaemonSet pod. Handles: GetBasePath (Docker inspect → overlay2 MergedDir), RestartSyncthing (restart the syncthing sidecar to refresh mounts), Restart (hot-reload user containers), and version/Docker info queries.",
    stats: "pkg/radar/ + cmd/radar/ • 8 files • 483 lines",
    level: "module",
    group: "k-radar",
    purpose: "The eyes and hands inside the cluster — resolves container filesystem paths and executes restart commands.",
    howItWorks: {
      overview: "gRPC server with Docker SDK access for container introspection.",
      workflow: [
        { step: 1, description: "GetBasePath receives a container ID, calls Docker inspect to get the overlay2 MergedDir path" },
        { step: 2, description: "RestartSyncthing finds the syncthing sidecar in the same pod and restarts it (refreshes mount tables)" },
        { step: 3, description: "Restart finds the user's container by ID and restarts it (hot-reload after file sync)" },
        { step: 4, description: "GetDockerVersion/Info return Docker daemon details for compatibility checks" },
      ],
    },
    connections: {
      inputs: [{ name: "Radar gRPC Client", id: "k-mod-radar-client" }],
      outputs: [],
    },
    dependencies: {
      external: ["google.golang.org/grpc", "docker/docker", "grpc-ecosystem/go-grpc-middleware"],
      internal: ["cmd/radar"],
    },
  },

  // ===== PROTO GROUP =====
  {
    id: "k-mod-proto",
    label: "Protobuf Definitions",
    type: "data",
    description: "Protocol buffer definitions for both gRPC services. ksync.proto defines the local Ksync service (GetSpecList, RestartSyncthing, IsAlive) with full message hierarchy (SpecList, Spec, SpecDetails, ServiceList, Service, RemoteContainer). radar.proto defines the remote Radar service (GetBasePath, RestartSyncthing, Restart, GetVersionInfo, GetDockerVersion, GetDockerInfo).",
    stats: "proto/ + pkg/proto/ • 4 files • ~1,245 lines (incl. generated)",
    level: "module",
    group: "k-proto",
    connections: {
      inputs: [],
      outputs: [],
    },
    dependencies: {
      external: ["golang/protobuf", "google.golang.org/grpc"],
      internal: [],
    },
  },

  // ===== REMOTE/INFRA GROUP =====
  {
    id: "k-mod-daemonset",
    label: "DaemonSet Deployment",
    type: "data",
    description: "Kubernetes resource definitions for the ksync cluster component. Creates a DaemonSet with two containers (radar + syncthing), ServiceAccount, PodSecurityPolicy, ClusterRole, and ClusterRoleBinding. Mounts Docker socket, Docker storage root, and kubelet directories.",
    stats: "pkg/ksync/cluster/daemon_set.go + docker/ • ~350 lines",
    level: "module",
    group: "k-infra",
    purpose: "The deployment manifest that puts ksync's remote components on every cluster node.",
    connections: {
      inputs: [{ name: "Cluster Management", id: "k-mod-cluster" }],
      outputs: [],
    },
    dependencies: {
      external: ["k8s.io/api", "k8s.io/apimachinery"],
      internal: [],
    },
  },
];

export const ksyncModuleEdges: GraphEdge[] = [
  // CLI → Core
  { id: "k-me-1", source: "k-mod-cli-commands", target: "k-mod-core", type: "call", label: "Watch, create, delete specs" },
  { id: "k-me-2", source: "k-mod-cli-commands", target: "k-mod-cli-utils", type: "import", label: "Flags, config, tasks" },
  { id: "k-me-3", source: "k-mod-cli-commands", target: "k-mod-input", type: "import", label: "Parse sync paths" },
  { id: "k-me-4", source: "k-mod-cli-commands", target: "k-mod-cluster", type: "call", label: "Init, clean, version" },
  { id: "k-me-5", source: "k-mod-cli-commands", target: "k-mod-doctor", type: "call", label: "Run diagnostics" },
  { id: "k-me-6", source: "k-mod-cli-commands", target: "k-mod-server", type: "call", label: "gRPC: get, reload" },

  // Core → dependencies
  { id: "k-me-7", source: "k-mod-core", target: "k-mod-syncthing", type: "call", label: "Manage syncthing process & config" },
  { id: "k-me-8", source: "k-mod-core", target: "k-mod-cluster", type: "call", label: "Create tunnels, watch pods" },
  { id: "k-me-9", source: "k-mod-core", target: "k-mod-radar-client", type: "call", label: "Resolve paths, restart containers" },
  { id: "k-me-10", source: "k-mod-core", target: "k-mod-server", type: "call", label: "Start gRPC server" },

  // Server → Core (queries spec list)
  { id: "k-me-11", source: "k-mod-server", target: "k-mod-core", type: "data", label: "Serialize SpecList" },

  // Doctor → Cluster + Radar
  { id: "k-me-12", source: "k-mod-doctor", target: "k-mod-cluster", type: "call", label: "Check K8s health" },
  { id: "k-me-13", source: "k-mod-doctor", target: "k-mod-radar-client", type: "call", label: "Check Docker compat" },

  // Radar client → server (gRPC)
  { id: "k-me-14", source: "k-mod-radar-client", target: "k-mod-radar-server", type: "call", label: "gRPC over tunnel" },

  // Proto used by server + radar
  { id: "k-me-15", source: "k-mod-server", target: "k-mod-proto", type: "import", label: "Ksync service proto" },
  { id: "k-me-16", source: "k-mod-radar-server", target: "k-mod-proto", type: "import", label: "Radar service proto" },
  { id: "k-me-17", source: "k-mod-radar-client", target: "k-mod-proto", type: "import", label: "Radar client stubs" },

  // Cluster → DaemonSet
  { id: "k-me-18", source: "k-mod-cluster", target: "k-mod-daemonset", type: "call", label: "Deploy K8s resources" },

  // Core → Debug
  { id: "k-me-19", source: "k-mod-core", target: "k-mod-debug", type: "import", label: "Logging helpers" },
];

// ============================================================
// L4 — FILE / DIRECTORY LEVEL
// ============================================================

export const ksyncFileNodes: GraphNode[] = [
  // ===== cmd/ksync/ (CLI commands) =====
  { id: "k-file-cmd-ksync", label: "ksync.go", type: "api", description: "cmd/ksync/ksync.go — root command, global flags, K8s client init", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },
  { id: "k-file-cmd-watch", label: "watch.go", type: "api", description: "cmd/ksync/watch.go — start daemon, load specs, watch K8s, start syncthing", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },
  { id: "k-file-cmd-create", label: "create.go", type: "api", description: "cmd/ksync/create.go — define new sync spec (local path ↔ remote path)", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },
  { id: "k-file-cmd-delete", label: "delete.go", type: "api", description: "cmd/ksync/delete.go — remove sync specs from config", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },
  { id: "k-file-cmd-get", label: "get.go", type: "api", description: "cmd/ksync/get.go — query watch daemon for spec status via gRPC", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },
  { id: "k-file-cmd-init", label: "init.go", type: "api", description: "cmd/ksync/init.go — bootstrap: download syncthing, deploy DaemonSet, run checks", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },
  { id: "k-file-cmd-doctor", label: "doctor.go", type: "api", description: "cmd/ksync/doctor.go — run 12 diagnostic checks with spinner output", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },
  { id: "k-file-cmd-clean", label: "clean.go", type: "api", description: "cmd/ksync/clean.go — teardown: remove DaemonSet, kill daemon, nuke config", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },
  { id: "k-file-cmd-restart", label: "restart.go", type: "api", description: "cmd/ksync/restart.go — manually trigger hot-reload on sync specs", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },
  { id: "k-file-cmd-update", label: "update.go", type: "api", description: "cmd/ksync/update.go — self-update via overseer GitHub fetcher", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },
  { id: "k-file-cmd-version", label: "version.go", type: "api", description: "cmd/ksync/version.go — show local + remote version info", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },
  { id: "k-file-cmd-daemon", label: "daemon.go", type: "api", description: "cmd/ksync/daemon.go — daemon context setup (PID file, log file)", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },
  { id: "k-file-cmd-clean-plat", label: "clean_{platform}.go", type: "api", description: "cmd/ksync/clean_unix.go + clean_windows.go — platform-specific daemon cleanup", stats: "2 files", level: "file", group: "k-cli", parentId: "k-mod-cli-commands" },

  // ===== pkg/cli/ (CLI utilities) =====
  { id: "k-file-cli-cmd", label: "cmd.go", type: "config", description: "pkg/cli/cmd.go — BaseCmd struct for flag binding", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-utils" },
  { id: "k-file-cli-config", label: "config.go", type: "config", description: "pkg/cli/config.go — config file init (~/.ksync/)", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-utils" },
  { id: "k-file-cli-flags", label: "flags.go", type: "config", description: "pkg/cli/flags.go — flag binding with env var naming", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-utils" },
  { id: "k-file-cli-finder", label: "finder.go", type: "config", description: "pkg/cli/finder.go — FinderCmd with --pod/--selector/--container flags", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-utils" },
  { id: "k-file-cli-tasks", label: "tasks.go", type: "config", description: "pkg/cli/tasks.go — spinner + colored pass/fail output", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-utils" },
  { id: "k-file-cli-init", label: "init.go", type: "config", description: "pkg/cli/init.go — logrus logger initialization", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-utils" },
  { id: "k-file-cli-doc", label: "doc.go", type: "config", description: "pkg/cli/doc.go — package documentation", stats: "", level: "file", group: "k-cli", parentId: "k-mod-cli-utils" },

  // ===== pkg/input/ =====
  { id: "k-file-input-sync-path", label: "sync_path.go", type: "config", description: "pkg/input/sync_path.go — SyncPath type, validation, permissions check", stats: "", level: "file", group: "k-cli", parentId: "k-mod-input" },
  { id: "k-file-input-doc", label: "doc.go", type: "config", description: "pkg/input/doc.go — package documentation", stats: "", level: "file", group: "k-cli", parentId: "k-mod-input" },

  // ===== pkg/debug/ =====
  { id: "k-file-debug-fields", label: "fields.go", type: "config", description: "pkg/debug/fields.go — MergeFields for logrus field maps", stats: "", level: "file", group: "k-cli", parentId: "k-mod-debug" },
  { id: "k-file-debug-tools", label: "tools.go", type: "config", description: "pkg/debug/tools.go — YamlString, StructFields, ErrorOut, ErrorLocation", stats: "", level: "file", group: "k-cli", parentId: "k-mod-debug" },

  // ===== pkg/ksync/ (core orchestration) =====
  { id: "k-file-spec", label: "spec.go", type: "utility", description: "pkg/ksync/spec.go — Spec type: watches K8s API, creates/cleans services on pod events", stats: "", level: "file", group: "k-core", parentId: "k-mod-core" },
  { id: "k-file-spec-list", label: "spec_list.go", type: "utility", description: "pkg/ksync/spec_list.go — SpecList: canonical spec collection, config file watch, add/delete/save", stats: "", level: "file", group: "k-core", parentId: "k-mod-core" },
  { id: "k-file-spec-details", label: "spec_details.go", type: "utility", description: "pkg/ksync/spec_details.go — SpecDetails: all config for a sync (name, selector, paths, reload)", stats: "", level: "file", group: "k-core", parentId: "k-mod-core" },
  { id: "k-file-service", label: "service.go", type: "utility", description: "pkg/ksync/service.go — Service type: active sync session with status tracking", stats: "", level: "file", group: "k-core", parentId: "k-mod-core" },
  { id: "k-file-service-list", label: "service_list.go", type: "utility", description: "pkg/ksync/service_list.go — ServiceList: manages per-pod services for a spec", stats: "", level: "file", group: "k-core", parentId: "k-mod-core" },
  { id: "k-file-folder", label: "folder.go", type: "utility", description: "pkg/ksync/folder.go — Folder: bulk orchestration — tunnels, syncthing config, events, hot-reload", stats: "", level: "file", group: "k-core", parentId: "k-mod-core" },
  { id: "k-file-remote-container", label: "remote_container.go", type: "utility", description: "pkg/ksync/remote_container.go — RemoteContainer: container ID, node, pod identity", stats: "", level: "file", group: "k-core", parentId: "k-mod-core" },
  { id: "k-file-syncthing-mgr", label: "syncthing.go", type: "utility", description: "pkg/ksync/syncthing.go — Syncthing process lifecycle (start, stop, fetch binary)", stats: "", level: "file", group: "k-core", parentId: "k-mod-core" },
  { id: "k-file-syncthing-plat", label: "syncthing_{platform}.go", type: "utility", description: "pkg/ksync/syncthing_linux.go + syncthing_other.go — platform-specific process attrs", stats: "2 files", level: "file", group: "k-core", parentId: "k-mod-core" },
  { id: "k-file-info", label: "info.go", type: "utility", description: "pkg/ksync/info.go — build-time version info (GitCommit, Tag, Date)", stats: "", level: "file", group: "k-core", parentId: "k-mod-core" },
  { id: "k-file-ksync-doc", label: "doc.go", type: "utility", description: "pkg/ksync/doc.go — package documentation", stats: "", level: "file", group: "k-core", parentId: "k-mod-core" },

  // ===== pkg/ksync/cluster/ =====
  { id: "k-file-cluster-client", label: "client.go", type: "utility", description: "pkg/ksync/cluster/client.go — K8s client singleton from kubeconfig", stats: "", level: "file", group: "k-core", parentId: "k-mod-cluster" },
  { id: "k-file-cluster-connection", label: "connection.go", type: "utility", description: "pkg/ksync/cluster/connection.go — Connection: tunneled access to node's radar + syncthing", stats: "", level: "file", group: "k-core", parentId: "k-mod-cluster" },
  { id: "k-file-cluster-daemonset", label: "daemon_set.go", type: "utility", description: "pkg/ksync/cluster/daemon_set.go — DaemonSet, ServiceAccount, PSP, ClusterRole definitions", stats: "", level: "file", group: "k-core", parentId: "k-mod-cluster" },
  { id: "k-file-cluster-service", label: "service.go", type: "utility", description: "pkg/ksync/cluster/service.go — DaemonSet lifecycle: install, health check, upgrade, remove", stats: "", level: "file", group: "k-core", parentId: "k-mod-cluster" },
  { id: "k-file-cluster-tunnel", label: "tunnel.go", type: "utility", description: "pkg/ksync/cluster/tunnel.go — SPDY port-forward from localhost to pod", stats: "", level: "file", group: "k-core", parentId: "k-mod-cluster" },
  { id: "k-file-cluster-error", label: "error_handler.go", type: "utility", description: "pkg/ksync/cluster/error_handler.go — custom K8s runtime error handler", stats: "", level: "file", group: "k-core", parentId: "k-mod-cluster" },
  { id: "k-file-cluster-doc", label: "doc.go", type: "utility", description: "pkg/ksync/cluster/doc.go — package documentation", stats: "", level: "file", group: "k-core", parentId: "k-mod-cluster" },

  // ===== pkg/ksync/doctor/ =====
  { id: "k-file-doctor-checks", label: "checks.go", type: "utility", description: "pkg/ksync/doctor/checks.go — CheckList: ordered list of 12 diagnostic checks", stats: "", level: "file", group: "k-core", parentId: "k-mod-doctor" },
  { id: "k-file-doctor-docker", label: "docker.go", type: "utility", description: "pkg/ksync/doctor/docker.go — Docker version, storage driver, graph root checks", stats: "", level: "file", group: "k-core", parentId: "k-mod-doctor" },
  { id: "k-file-doctor-k8s", label: "kubernetes.go", type: "utility", description: "pkg/ksync/doctor/kubernetes.go — K8s version, config, connection, permissions checks", stats: "", level: "file", group: "k-core", parentId: "k-mod-doctor" },
  { id: "k-file-doctor-local", label: "local.go", type: "utility", description: "pkg/ksync/doctor/local.go — syncthing binary exists, watch daemon running", stats: "", level: "file", group: "k-core", parentId: "k-mod-doctor" },
  { id: "k-file-doctor-service", label: "service.go", type: "utility", description: "pkg/ksync/doctor/service.go — DaemonSet installed, healthy, version compatible", stats: "", level: "file", group: "k-core", parentId: "k-mod-doctor" },
  { id: "k-file-doctor-versions", label: "versions.go", type: "utility", description: "pkg/ksync/doctor/versions.go — version range constants (K8s ≥1.7, Docker API ≥1.25)", stats: "", level: "file", group: "k-core", parentId: "k-mod-doctor" },
  { id: "k-file-doctor-doc", label: "doc.go", type: "utility", description: "pkg/ksync/doctor/doc.go — package documentation", stats: "", level: "file", group: "k-core", parentId: "k-mod-doctor" },

  // ===== pkg/ksync/server/ =====
  { id: "k-file-server-grpc", label: "grpc.go", type: "api", description: "pkg/ksync/server/grpc.go — gRPC server setup with logrus middleware", stats: "", level: "file", group: "k-core", parentId: "k-mod-server" },
  { id: "k-file-server-spec", label: "spec.go", type: "api", description: "pkg/ksync/server/spec.go — GetSpecList RPC implementation", stats: "", level: "file", group: "k-core", parentId: "k-mod-server" },
  { id: "k-file-server-restart", label: "restart.go", type: "api", description: "pkg/ksync/server/restart.go — RestartSyncthing, IsAlive RPCs with debounce", stats: "", level: "file", group: "k-core", parentId: "k-mod-server" },
  { id: "k-file-server-doc", label: "doc.go", type: "api", description: "pkg/ksync/server/doc.go — package documentation", stats: "", level: "file", group: "k-core", parentId: "k-mod-server" },

  // ===== pkg/syncthing/ =====
  { id: "k-file-st-server", label: "server.go", type: "component", description: "pkg/syncthing/server.go — REST API client: Refresh, Update, Restart, Stop, IsAlive", stats: "", level: "file", group: "k-syncthing", parentId: "k-mod-syncthing" },
  { id: "k-file-st-device", label: "device.go", type: "component", description: "pkg/syncthing/device.go — Get/Set/RemoveDevice for peer configuration", stats: "", level: "file", group: "k-syncthing", parentId: "k-mod-syncthing" },
  { id: "k-file-st-folder", label: "folder.go", type: "component", description: "pkg/syncthing/folder.go — Get/Set/RemoveFolder for sync directory configuration", stats: "", level: "file", group: "k-syncthing", parentId: "k-mod-syncthing" },
  { id: "k-file-st-events", label: "events.go", type: "component", description: "pkg/syncthing/events.go — long-poll events endpoint, returns event channel", stats: "", level: "file", group: "k-syncthing", parentId: "k-mod-syncthing" },
  { id: "k-file-st-fetch", label: "fetch.go", type: "component", description: "pkg/syncthing/fetch.go — download syncthing binary from GitHub releases", stats: "", level: "file", group: "k-syncthing", parentId: "k-mod-syncthing" },
  { id: "k-file-st-config", label: "default_config.go", type: "component", description: "pkg/syncthing/default_config.go — default XML config with discovery/relay disabled", stats: "", level: "file", group: "k-syncthing", parentId: "k-mod-syncthing" },
  { id: "k-file-st-doc", label: "doc.go", type: "component", description: "pkg/syncthing/doc.go — package documentation", stats: "", level: "file", group: "k-syncthing", parentId: "k-mod-syncthing" },

  // ===== pkg/radar/ (server implementation) =====
  { id: "k-file-radar-server", label: "server.go", type: "api", description: "pkg/radar/server.go — gRPC server creation with logging middleware", stats: "", level: "file", group: "k-radar", parentId: "k-mod-radar-server" },
  { id: "k-file-radar-docker", label: "docker.go", type: "api", description: "pkg/radar/docker.go — Docker inspect for overlay2 paths, version/info queries", stats: "", level: "file", group: "k-radar", parentId: "k-mod-radar-server" },
  { id: "k-file-radar-path", label: "path.go", type: "api", description: "pkg/radar/path.go — GetBasePath RPC: container ID → host filesystem path", stats: "", level: "file", group: "k-radar", parentId: "k-mod-radar-server" },
  { id: "k-file-radar-restart", label: "restart.go", type: "api", description: "pkg/radar/restart.go — RestartSyncthing + Restart RPCs for container lifecycle", stats: "", level: "file", group: "k-radar", parentId: "k-mod-radar-server" },
  { id: "k-file-radar-info", label: "info.go", type: "api", description: "pkg/radar/info.go — GetVersionInfo RPC with build-time stamps", stats: "", level: "file", group: "k-radar", parentId: "k-mod-radar-server" },
  { id: "k-file-radar-doc", label: "doc.go", type: "api", description: "pkg/radar/doc.go — package documentation", stats: "", level: "file", group: "k-radar", parentId: "k-mod-radar-server" },

  // ===== cmd/radar/ =====
  { id: "k-file-cmd-radar", label: "radar.go", type: "api", description: "cmd/radar/radar.go — radar binary entry point, --pod-name flag", stats: "", level: "file", group: "k-radar", parentId: "k-mod-radar-server" },
  { id: "k-file-cmd-radar-serve", label: "serve.go", type: "api", description: "cmd/radar/serve.go — start gRPC server on port 40321", stats: "", level: "file", group: "k-radar", parentId: "k-mod-radar-server" },

  // ===== proto/ + pkg/proto/ =====
  { id: "k-file-proto-ksync", label: "ksync.proto", type: "data", description: "proto/ksync.proto — Ksync gRPC service: GetSpecList, RestartSyncthing, IsAlive", stats: "", level: "file", group: "k-proto", parentId: "k-mod-proto" },
  { id: "k-file-proto-radar", label: "radar.proto", type: "data", description: "proto/radar.proto — Radar gRPC service: GetBasePath, Restart, GetDockerVersion", stats: "", level: "file", group: "k-proto", parentId: "k-mod-proto" },
  { id: "k-file-proto-ksync-pb", label: "ksync.pb.go", type: "data", description: "pkg/proto/ksync.pb.go — generated Go code for Ksync protobuf messages + gRPC stubs", stats: "", level: "file", group: "k-proto", parentId: "k-mod-proto" },
  { id: "k-file-proto-radar-pb", label: "radar.pb.go", type: "data", description: "pkg/proto/radar.pb.go — generated Go code for Radar protobuf messages + gRPC stubs", stats: "", level: "file", group: "k-proto", parentId: "k-mod-proto" },

  // ===== docker/ (DaemonSet image) =====
  { id: "k-file-dockerfile", label: "Dockerfile", type: "data", description: "docker/Dockerfile — Alpine image with syncthing + radar binary", stats: "", level: "file", group: "k-infra", parentId: "k-mod-daemonset" },
  { id: "k-file-docker-config", label: "config.xml", type: "data", description: "docker/config.xml — remote syncthing default config (discovery/relay disabled)", stats: "", level: "file", group: "k-infra", parentId: "k-mod-daemonset" },
];

export const ksyncFileEdges: GraphEdge[] = [];
