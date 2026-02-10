import { memo } from "react";
import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { cn } from "@/lib/utils";

export interface AnimatedEdgeData {
  type: "import" | "export" | "call" | "data";
  isCircular?: boolean;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  sourceColor?: string;
  label?: string;
}

function AnimatedEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as unknown as AnimatedEdgeData | undefined;
  const edgeType = edgeData?.type || "import";
  const isCircular = edgeData?.isCircular || false;
  const isHighlighted = edgeData?.isHighlighted || selected;
  const isDimmed = edgeData?.isDimmed || false;
  
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  // Edge styling based on type
  const getEdgeStyle = () => {
    const baseStyle = {
      strokeWidth: isHighlighted ? 2.5 : 1.5,
      opacity: isDimmed ? 0.15 : 1,
    };

    if (isCircular) {
      return {
        ...baseStyle,
        stroke: "hsl(0, 84%, 60%)",
        strokeDasharray: "none",
      };
    }

    switch (edgeType) {
      case "export":
        return {
          ...baseStyle,
          stroke: isHighlighted ? "hsl(239, 84%, 67%)" : "hsl(220, 13%, 75%)",
          strokeDasharray: "8 4",
        };
      case "call":
        return {
          ...baseStyle,
          stroke: isHighlighted ? "hsl(239, 84%, 67%)" : "hsl(220, 13%, 75%)",
          strokeDasharray: "4 4",
        };
      case "data":
        return {
          ...baseStyle,
          stroke: isHighlighted ? "hsl(239, 84%, 67%)" : "hsl(220, 13%, 75%)",
          strokeWidth: isHighlighted ? 3 : 2,
        };
      default: // import
        return {
          ...baseStyle,
          stroke: isHighlighted ? "hsl(239, 84%, 67%)" : "hsl(220, 13%, 75%)",
          strokeDasharray: "none",
        };
    }
  };

  const edgeStyle = getEdgeStyle();

  return (
    <g className="react-flow__edge">
      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
      />

      {/* Animated dot overlay - only show when not dimmed */}
      {!isDimmed && (
        <circle
          r={isHighlighted ? 4 : 3}
          fill={isCircular ? "hsl(0, 84%, 60%)" : "hsl(239, 84%, 67%)"}
          className={cn(
            isCircular ? "animate-pulse" : ""
          )}
        >
          <animateMotion
            dur={isCircular ? "1s" : edgeType === "call" ? "0.8s" : "1.5s"}
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}

      {/* Circular dependency indicator */}
      {isCircular && (
        <>
          {/* Pulsing glow */}
          <path
            d={edgePath}
            fill="none"
            stroke="hsl(0, 84%, 60%)"
            strokeWidth={6}
            strokeOpacity={0.2}
            className="animate-pulse"
          />
          {/* Second dot going opposite direction */}
          <circle r={3} fill="hsl(0, 84%, 60%)" className="animate-pulse">
            <animateMotion
              dur="1s"
              repeatCount="indefinite"
              path={edgePath}
              keyPoints="1;0"
              keyTimes="0;1"
            />
          </circle>
        </>
      )}
    </g>
  );
}

export const AnimatedEdge = memo(AnimatedEdgeComponent);
