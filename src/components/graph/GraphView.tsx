import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Layers, LogOut, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GraphNode } from "./GraphNode";
import { GroupNode } from "./GroupNode";
import { AnimatedEdge } from "./AnimatedEdge";
import { GraphSidebar, EdgeFilters } from "./GraphSidebar";
import { DetailPanel } from "./DetailPanel";
import { OnboardingTour } from "./OnboardingTour";
import {
  ZoomLevel,
  GraphNode as GraphNodeType,
  SystemGroup,
  getNodesForLevel,
  getEdgesForLevel,
  getNodesGroupedBySystem,
  getSystemGroupsForRepo,
  demoRepositories,
} from "@/data/demoData";
import {
  FocusModeState,
  defaultFocusModeState,
  computeNHopNeighbors,
} from "@/lib/focusMode";

const nodeTypes = {
  custom: GraphNode,
  group: GroupNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

// Group labels are now derived per-repo inside GraphViewInner

// Node dimensions
const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const NODE_SPACING_X = 280;
const NODE_SPACING_Y = 140;
const GROUP_PADDING = 60;
const GROUP_GAP = 80;

// Calculate dimensions needed for a group based on node count
function calculateGroupDimensions(nodeCount: number): { width: number; height: number; cols: number } {
  if (nodeCount === 0) return { width: 0, height: 0, cols: 0 };

  const cols = nodeCount <= 4 ? 2 : Math.min(4, Math.ceil(Math.sqrt(nodeCount)));
  const rows = Math.ceil(nodeCount / cols);

  const width = cols * NODE_SPACING_X + GROUP_PADDING * 2;
  const height = rows * NODE_SPACING_Y + GROUP_PADDING * 2 + 30;

  return { width, height, cols };
}

// Dynamically calculate group positions for N groups using a grid layout
function calculateDynamicGroupPositions(
  groupedNodes: Map<SystemGroup, GraphNodeType[]>,
  repoGroups: { id: SystemGroup; label: string; color: string }[]
): Map<SystemGroup, { x: number; y: number; cols: number }> {
  const positions = new Map<SystemGroup, { x: number; y: number; cols: number }>();

  // Collect groups that have nodes
  const activeGroups = repoGroups.filter(
    (g) => (groupedNodes.get(g.id)?.length || 0) > 0
  );

  if (activeGroups.length === 0) return positions;

  // Grid layout: rows of 3
  const GRID_COLS = 3;
  const startX = 100;
  const startY = 100;

  // Calculate dimensions for all groups
  const groupDims = new Map<string, { width: number; height: number; cols: number }>();
  for (const g of repoGroups) {
    groupDims.set(g.id, calculateGroupDimensions(groupedNodes.get(g.id)?.length || 0));
  }

  // Place groups in a grid of GRID_COLS columns
  let currentY = startY;

  for (let rowStart = 0; rowStart < activeGroups.length; rowStart += GRID_COLS) {
    const rowGroups = activeGroups.slice(rowStart, rowStart + GRID_COLS);
    let currentX = startX;
    let rowMaxHeight = 0;

    for (const g of rowGroups) {
      const dims = groupDims.get(g.id) || { width: 400, height: 400, cols: 2 };
      positions.set(g.id, {
        x: currentX,
        y: currentY,
        cols: dims.cols || 2,
      });
      currentX += (dims.width || 400) + GROUP_GAP;
      rowMaxHeight = Math.max(rowMaxHeight, dims.height || 400);
    }

    currentY += rowMaxHeight + GROUP_GAP;
  }

  return positions;
}

// Calculate the bounding box for a group of nodes
const calculateGroupBounds = (
  nodes: Node[],
  group: SystemGroup,
  padding: number = 40
): { x: number; y: number; width: number; height: number } | null => {
  const groupNodes = nodes.filter(
    (n) => (n.data as { group?: SystemGroup }).group === group
  );

  if (groupNodes.length === 0) return null;

  const positions = groupNodes.map((n) => ({
    x: n.position.x,
    y: n.position.y,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  }));

  const minX = Math.min(...positions.map((p) => p.x)) - padding;
  const minY = Math.min(...positions.map((p) => p.y)) - padding - 20;
  const maxX = Math.max(...positions.map((p) => p.x + p.width)) + padding;
  const maxY = Math.max(...positions.map((p) => p.y + p.height)) + padding;

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// Layout positions for nodes with group clustering
const getNodePosition = (
  index: number,
  level: ZoomLevel,
  total: number,
  node?: GraphNodeType,
  groupedNodes?: Map<SystemGroup, GraphNodeType[]>,
  dynamicGroupPositions?: Map<SystemGroup, { x: number; y: number; cols: number }>
) => {
  // Context level: radial layout with center system node
  if (level === "context") {
    if (index === 0) return { x: 600, y: 400 };
    const angle = ((index - 1) / (total - 1)) * 2 * Math.PI - Math.PI / 2;
    return {
      x: 600 + Math.cos(angle) * 350,
      y: 400 + Math.sin(angle) * 350,
    };
  }

  // System level: clean grid layout with more spacing
  if (level === "system") {
    const cols = 3;
    const spacingX = 380;
    const spacingY = 280;
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      x: 200 + col * spacingX,
      y: 200 + row * spacingY,
    };
  }

  // Module/File level: group by system with dynamic positions
  if (node?.group && groupedNodes && dynamicGroupPositions) {
    const groupNodes = groupedNodes.get(node.group) || [];
    const nodeIndex = groupNodes.findIndex(n => n.id === node.id);
    const groupPos = dynamicGroupPositions.get(node.group);

    if (groupPos) {
      const cols = groupPos.cols || 3;
      const row = Math.floor(nodeIndex / cols);
      const col = nodeIndex % cols;

      return {
        x: groupPos.x + GROUP_PADDING + col * NODE_SPACING_X,
        y: groupPos.y + GROUP_PADDING + 30 + row * NODE_SPACING_Y,
      };
    }
  }

  // Fallback
  const cols = 3;
  const spacingX = 340;
  const spacingY = 200;
  const row = Math.floor(index / cols);
  const col = index % cols;
  return {
    x: 150 + col * spacingX,
    y: 150 + row * spacingY,
  };
};

function GraphViewInner() {
  const navigate = useNavigate();
  const { repoId } = useParams();
  const reactFlowInstance = useReactFlow();

  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("module");
  const [selectedNode, setSelectedNode] = useState<GraphNodeType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [edgeFilters, setEdgeFilters] = useState<EdgeFilters>({
    imports: true,
    exports: true,
    calls: true,
    data: true,
  });
  const [focusMode, setFocusMode] = useState<FocusModeState>(defaultFocusModeState);
  // Track which module we drilled into for L4 filtering
  const [fileModuleId, setFileModuleId] = useState<string | null>(null);

  const repo = demoRepositories.find((r) => r.id === repoId) || demoRepositories[0];

  // Get repo-specific system groups
  const repoSystemGroups = useMemo(() => getSystemGroupsForRepo(repoId), [repoId]);
  const groupLabels: Record<string, string> = useMemo(
    () => Object.fromEntries(repoSystemGroups.map((g) => [g.id, g.label])),
    [repoSystemGroups]
  );

  // Convert demo data to React Flow nodes — filter file level by parent module
  const graphNodes = useMemo(() => {
    const nodes = getNodesForLevel(zoomLevel, repoId);
    if (zoomLevel === "file" && fileModuleId) {
      return nodes.filter((n) => n.parentId === fileModuleId);
    }
    return nodes;
  }, [zoomLevel, fileModuleId, repoId]);
  const graphEdges = useMemo(() => getEdgesForLevel(zoomLevel, repoId), [zoomLevel, repoId]);
  const groupedNodes = useMemo(() => getNodesGroupedBySystem(graphNodes, repoId), [graphNodes, repoId]);

  // Calculate dynamic group positions based on node counts
  const dynamicGroupPositions = useMemo(
    () => calculateDynamicGroupPositions(groupedNodes, repoSystemGroups),
    [groupedNodes, repoSystemGroups]
  );

  // Compute focused node IDs when focus mode is enabled
  const focusedNodeIds = useMemo(() => {
    if (!focusMode.enabled || !selectedNode) {
      return new Set<string>();
    }
    return computeNHopNeighbors(selectedNode.id, graphEdges, focusMode.depth);
  }, [focusMode.enabled, focusMode.depth, selectedNode, graphEdges]);

  // Create regular nodes first
  const regularNodes: Node[] = useMemo(() => {
    const allNodes = graphNodes.map((node, index) => ({
      id: node.id,
      type: "custom",
      position: getNodePosition(index, zoomLevel, graphNodes.length, node, groupedNodes, dynamicGroupPositions),
      data: {
        label: node.label,
        type: node.type,
        description: node.description,
        stats: node.stats,
        hasProblem: node.hasProblem,
        group: node.group,
        isHighlighted: selectedNode?.id === node.id,
        isDimmed:
          (searchQuery && !node.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (focusMode.enabled && selectedNode && !focusedNodeIds.has(node.id)),
      },
    }));

    // In "hide" mode, filter out non-focused nodes
    if (focusMode.enabled && focusMode.displayMode === "hide" && selectedNode) {
      return allNodes.filter((node) => focusedNodeIds.has(node.id));
    }
    return allNodes;
  }, [graphNodes, zoomLevel, selectedNode, searchQuery, groupedNodes, dynamicGroupPositions, focusMode, focusedNodeIds]);

  // Create group background nodes that move with the canvas
  const groupNodes: Node[] = useMemo(() => {
    if (zoomLevel === "system" || zoomLevel === "context") return [];

    const groups: Node[] = [];

    for (const [groupKey, label] of Object.entries(groupLabels)) {
      const group = groupKey as SystemGroup;
      const bounds = calculateGroupBounds(regularNodes, group);

      if (bounds) {
        groups.push({
          id: `group-${group}`,
          type: "group",
          position: { x: bounds.x, y: bounds.y },
          data: {
            label: label,
            group: group,
            width: bounds.width,
            height: bounds.height,
          },
          zIndex: -1,
          selectable: false,
          draggable: false,
        });
      }
    }

    return groups;
  }, [regularNodes, zoomLevel, groupLabels]);

  // Combine group nodes (background) with regular nodes
  const initialNodes: Node[] = useMemo(() => {
    return [...groupNodes, ...regularNodes];
  }, [groupNodes, regularNodes]);

  const initialEdges: Edge[] = useMemo(() => {
    let filteredEdges = graphEdges.filter((edge) => {
      // Filter by type
      const typeMap: Record<string, keyof EdgeFilters> = {
        import: "imports",
        export: "exports",
        call: "calls",
        data: "data",
      };
      return edgeFilters[typeMap[edge.type]];
    });

    // In "hide" mode, filter out edges where both endpoints aren't visible
    if (focusMode.enabled && focusMode.displayMode === "hide" && selectedNode) {
      filteredEdges = filteredEdges.filter(
        (edge) => focusedNodeIds.has(edge.source) && focusedNodeIds.has(edge.target)
      );
    }

    return filteredEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "animated",
      data: {
        type: edge.type,
        isCircular: edge.isCircular,
        label: edge.label,
        isHighlighted:
          selectedNode?.id === edge.source || selectedNode?.id === edge.target,
        isDimmed:
          (searchQuery
            ? !graphNodes.some(
                (n) =>
                  (n.id === edge.source || n.id === edge.target) &&
                  n.label.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : false) ||
          (focusMode.enabled &&
            selectedNode &&
            focusMode.displayMode === "dim" &&
            (!focusedNodeIds.has(edge.source) || !focusedNodeIds.has(edge.target))),
      },
    }));
  }, [graphEdges, graphNodes, edgeFilters, selectedNode, searchQuery, focusMode, focusedNodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when deps change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const graphNode = graphNodes.find((n) => n.id === node.id);
      if (!graphNode) return;

      // Double-click behavior: if clicking a module at L3, drill into L4
      if (zoomLevel === "module" && graphNode.level === "module") {
        // Check if this module has children at L4
        const repoFileNodes = getNodesForLevel("file", repoId);
        const hasChildren = repoFileNodes.some((n) => n.parentId === graphNode.id);
        if (hasChildren) {
          setFileModuleId(graphNode.id);
          setZoomLevel("file");
          setSelectedNode(null);
          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
          }, 100);
          return;
        }
      }

      setSelectedNode(graphNode);
    },
    [graphNodes, zoomLevel, reactFlowInstance]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleZoomChange = useCallback((level: ZoomLevel) => {
    setZoomLevel(level);
    setSelectedNode(null);
    if (level !== "file") setFileModuleId(null);
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
    }, 100);
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
  }, [reactFlowInstance]);

  const handleEdgeFilterChange = useCallback(
    (filter: keyof EdgeFilters, value: boolean) => {
      setEdgeFilters((prev) => ({ ...prev, [filter]: value }));
    },
    []
  );

  const handleNavigateToNode = useCallback(
    (nodeId: string) => {
      const graphNode = graphNodes.find((n) => n.id === nodeId);
      if (graphNode) {
        setSelectedNode(graphNode);
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          reactFlowInstance.setCenter(node.position.x + 100, node.position.y + 50, {
            zoom: 1,
            duration: 500,
          });
        }
      }
    },
    [graphNodes, nodes, reactFlowInstance]
  );

  const handleRepoChange = useCallback(
    (newRepoId: string) => {
      navigate(`/loading/${newRepoId}`);
    },
    [navigate]
  );

  const handleSignOut = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Handle navigation to file from Code tab — drill into the parent module
  const handleNavigateToFile = useCallback(
    (filePath: string) => {
      // Find the file node by matching the path
      const repoFileNodes = getNodesForLevel("file", repoId);
      const fileNode = repoFileNodes.find(
        (n) =>
          n.label.toLowerCase().includes(filePath.toLowerCase()) ||
          filePath.toLowerCase().includes(n.label.toLowerCase())
      );

      if (fileNode && fileNode.parentId) {
        setFileModuleId(fileNode.parentId);
        setZoomLevel("file");

        // Small delay to let the zoom level change take effect
        setTimeout(() => {
          setSelectedNode(fileNode);
          reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
        }, 150);
      }
    },
    [reactFlowInstance]
  );

  // Handle back navigation from L4 to L3
  const handleBackToModules = useCallback(() => {
    setZoomLevel("module");
    setFileModuleId(null);
    setSelectedNode(null);
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
    }, 100);
  }, [reactFlowInstance]);

  // Get zoom level label — show parent module name at file level
  const getZoomLabel = () => {
    switch (zoomLevel) {
      case "context":
        return "Context View";
      case "system":
        return "System View";
      case "module":
        return "Module View";
      case "file": {
        if (fileModuleId) {
          const repoModuleNodes = getNodesForLevel("module", repoId);
          const parentModule = repoModuleNodes.find((n) => n.id === fileModuleId);
          return parentModule ? `Files: ${parentModule.label}` : "File View";
        }
        return "File View";
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Top navigation */}
      <header className="h-14 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold hidden sm:block">Legend</span>
          </div>

          {/* Repo selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <span className="font-medium">{repo.name}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {demoRepositories.map((r) => (
                <DropdownMenuItem key={r.id} onClick={() => handleRepoChange(r.id)}>
                  {r.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Back button when at file level */}
          {zoomLevel === "file" && fileModuleId && (
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleBackToModules}>
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Modules</span>
            </Button>
          )}

          {/* Zoom level indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
            <span className="text-muted-foreground">View:</span>
            <span className="font-medium">{getZoomLabel()}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files, functions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9"
            />
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <GraphSidebar
          zoomLevel={zoomLevel}
          onZoomChange={handleZoomChange}
          edgeFilters={edgeFilters}
          onEdgeFilterChange={handleEdgeFilterChange}
          onFitView={handleFitView}
          focusMode={focusMode}
          onFocusModeChange={(updates) => setFocusMode((prev) => ({ ...prev, ...updates }))}
          hasSelectedNode={!!selectedNode}
        />

        {/* Graph canvas */}
        <motion.div
          className="flex-1 relative"
          animate={{ width: selectedNode ? "calc(100% - 400px)" : "100%" }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="hsl(var(--muted-foreground) / 0.15)" gap={24} size={1} />


            <MiniMap
              nodeColor={(node) => {
                const data = node.data as { hasProblem?: boolean };
                return data?.hasProblem ? "hsl(var(--destructive))" : "hsl(var(--primary))";
              }}
              maskColor="hsla(var(--background) / 0.8)"
              className="!bg-card !border rounded-lg"
            />
          </ReactFlow>
        </motion.div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedNode && (
            <DetailPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onNavigateToNode={handleNavigateToNode}
              onNavigateToFile={handleNavigateToFile}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Onboarding tour */}
      <OnboardingTour
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}

export function GraphView() {
  return (
    <ReactFlowProvider>
      <GraphViewInner />
    </ReactFlowProvider>
  );
}
