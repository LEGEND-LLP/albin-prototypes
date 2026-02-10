import { useState } from "react";
import { motion } from "framer-motion";
import {
  Maximize2,
  GitBranch,
  ArrowRight,
  Zap,
  Database,
  ChevronDown,
  ChevronRight,
  Focus,
  Eye,
  EyeOff,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ZoomLevel } from "@/data/demoData";
import { cn } from "@/lib/utils";
import { FocusModeState } from "@/lib/focusMode";

export interface EdgeFilters {
  imports: boolean;
  exports: boolean;
  calls: boolean;
  data: boolean;
}

interface GraphSidebarProps {
  zoomLevel: ZoomLevel;
  onZoomChange: (level: ZoomLevel) => void;
  edgeFilters: EdgeFilters;
  onEdgeFilterChange: (filter: keyof EdgeFilters, value: boolean) => void;
  onFitView: () => void;
  focusMode: FocusModeState;
  onFocusModeChange: (updates: Partial<FocusModeState>) => void;
  hasSelectedNode: boolean;
}

const zoomLevels: { level: ZoomLevel; label: string; icon: React.ElementType }[] = [
  { level: "context", label: "Context", icon: Globe },
  { level: "system", label: "System", icon: Maximize2 },
  { level: "module", label: "Module", icon: GitBranch },
  { level: "file", label: "File", icon: Database },
];

export function GraphSidebar({
  zoomLevel,
  onZoomChange,
  edgeFilters,
  onEdgeFilterChange,
  onFitView,
  focusMode,
  onFocusModeChange,
  hasSelectedNode,
}: GraphSidebarProps) {
  const [isEdgeFiltersOpen, setIsEdgeFiltersOpen] = useState(true);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(true);
  
  const zoomIndex = zoomLevels.findIndex(z => z.level === zoomLevel);

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-sidebar border-r h-full flex flex-col"
    >
      {/* Zoom slider section */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-sidebar-foreground mb-4">Zoom Level</h3>
        
        <div className="space-y-3">
          {zoomLevels.map((item) => {
            const Icon = item.icon;
            const isActive = item.level === zoomLevel;
            
            return (
              <button
                key={item.level}
                onClick={() => onZoomChange(item.level)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Slider indicator */}
        <div className="mt-4 px-3">
          <Slider
            value={[zoomIndex]}
            max={3}
            step={1}
            onValueChange={([value]) => onZoomChange(zoomLevels[value].level)}
            className="w-full"
          />
        </div>
      </div>

      <Separator />

      {/* Edge filters section */}
      <div className="p-4">
        <button
          onClick={() => setIsEdgeFiltersOpen(!isEdgeFiltersOpen)}
          className="w-full flex items-center justify-between text-sm font-medium text-sidebar-foreground mb-3"
        >
          <span>Edge Types</span>
          {isEdgeFiltersOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {isEdgeFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <EdgeFilterItem
              icon={<ArrowRight className="w-4 h-4" />}
              label="Imports"
              description="Solid line"
              checked={edgeFilters.imports}
              onChange={(checked) => onEdgeFilterChange("imports", checked)}
            />
            <EdgeFilterItem
              icon={<ArrowRight className="w-4 h-4 opacity-50" />}
              label="Exports"
              description="Dashed line"
              checked={edgeFilters.exports}
              onChange={(checked) => onEdgeFilterChange("exports", checked)}
            />
            <EdgeFilterItem
              icon={<Zap className="w-4 h-4" />}
              label="Function Calls"
              description="Dotted line"
              checked={edgeFilters.calls}
              onChange={(checked) => onEdgeFilterChange("calls", checked)}
            />
            <EdgeFilterItem
              icon={<Database className="w-4 h-4" />}
              label="Data Flow"
              description="Thick line"
              checked={edgeFilters.data}
              onChange={(checked) => onEdgeFilterChange("data", checked)}
            />
          </motion.div>
        )}
      </div>

      <Separator />

      {/* Focus Mode section */}
      <div className="p-4">
        <button
          onClick={() => setIsFocusModeOpen(!isFocusModeOpen)}
          className="w-full flex items-center justify-between text-sm font-medium text-sidebar-foreground mb-3"
        >
          <span className="flex items-center gap-2">
            <Focus className="w-4 h-4" />
            Focus Mode
          </span>
          {isFocusModeOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {isFocusModeOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Enable switch */}
            <div className="flex items-center justify-between">
              <Label className={cn("text-sm", !hasSelectedNode && "opacity-50")}>
                Enable Focus
              </Label>
              <Switch
                checked={focusMode.enabled}
                onCheckedChange={(checked) => onFocusModeChange({ enabled: checked })}
                disabled={!hasSelectedNode}
              />
            </div>

            {/* Display mode toggle */}
            <div className={cn("space-y-2", (!hasSelectedNode || !focusMode.enabled) && "opacity-50 pointer-events-none")}>
              <Label className="text-sm">Display Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={focusMode.displayMode === "dim" ? "secondary" : "ghost"}
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => onFocusModeChange({ displayMode: "dim" })}
                  disabled={!hasSelectedNode || !focusMode.enabled}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Dim
                </Button>
                <Button
                  variant={focusMode.displayMode === "hide" ? "secondary" : "ghost"}
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => onFocusModeChange({ displayMode: "hide" })}
                  disabled={!hasSelectedNode || !focusMode.enabled}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Hide
                </Button>
              </div>
            </div>

            {/* Depth slider */}
            <div className={cn("space-y-2", (!hasSelectedNode || !focusMode.enabled) && "opacity-50 pointer-events-none")}>
              <div className="flex justify-between">
                <Label className="text-sm">Connection Depth</Label>
                <span className="text-sm text-muted-foreground">
                  {focusMode.depth} hop{focusMode.depth > 1 ? "s" : ""}
                </span>
              </div>
              <Slider
                value={[focusMode.depth]}
                min={1}
                max={3}
                step={1}
                onValueChange={([v]) => onFocusModeChange({ depth: v })}
                disabled={!hasSelectedNode || !focusMode.enabled}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>2</span>
                <span>3</span>
              </div>
            </div>

            {/* Helper text when no node selected */}
            {!hasSelectedNode && (
              <p className="text-xs text-muted-foreground italic">
                Select a node to enable focus mode
              </p>
            )}
          </motion.div>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="p-4 mt-auto">
        <Button
          variant="secondary"
          className="w-full"
          onClick={onFitView}
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          Fit to screen
        </Button>
      </div>
    </motion.aside>
  );
}

interface EdgeFilterItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function EdgeFilterItem({ icon, label, description, checked, onChange }: EdgeFilterItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="text-sidebar-foreground">{icon}</div>
        <div>
          <Label className="text-sm text-sidebar-foreground">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
