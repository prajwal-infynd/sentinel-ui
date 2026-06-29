import { useMemo, useCallback, memo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  MarkerType,
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
  useInternalNode,
  getStraightPath,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
  type InternalNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Expand,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  Network,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Type → colour palette (mirrors the previous canvas chip styling)  */
/* ------------------------------------------------------------------ */
const getChipColors = (t: string) => {
  const tl = (t || "").toLowerCase();
  if (tl === "person") return { border: "#F59E0B", text: "#92400E", typeBg: "#FEF3C7", typeText: "#D97706" };
  if (tl === "country") return { border: "#06B6D4", text: "#164E63", typeBg: "#CFFAFE", typeText: "#0E7490" };
  if (tl === "state/province" || tl === "city") return { border: "#0EA5E9", text: "#0C4A6E", typeBg: "#E0F2FE", typeText: "#0369A1" };
  if (tl === "industry") return { border: "#10B981", text: "#064E3B", typeBg: "#D1FAE5", typeText: "#059669" };
  if (tl === "regulator") return { border: "#EF4444", text: "#7F1D1D", typeBg: "#FEE2E2", typeText: "#DC2626" };
  if (tl === "social media") return { border: "#EC4899", text: "#831843", typeBg: "#FCE7F3", typeText: "#BE185D" };
  if (tl === "news article") return { border: "#8B5CF6", text: "#4C1D95", typeBg: "#EDE9FE", typeText: "#7C3AED" };
  if (tl === "asset") return { border: "#F97316", text: "#7C2D12", typeBg: "#FFEDD5", typeText: "#EA580C" };
  if (tl === "director") return { border: "#F59E0B", text: "#92400E", typeBg: "#FEF3C7", typeText: "#D97706" };
  if (tl.includes("litigation") || tl.includes("investigation")) return { border: "#EF4444", text: "#7F1D1D", typeBg: "#FEE2E2", typeText: "#DC2626" };
  // Company default: blue/indigo
  return { border: "#6366F1", text: "#1E1B4B", typeBg: "#EEF2FF", typeText: "#4F46E5" };
};

type EntityNodeData = {
  label: string;
  entityType: string;
  selected?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Custom node — white rounded chip with coloured border + type tag  */
/* ------------------------------------------------------------------ */
const EntityNode = memo(({ data }: NodeProps<Node<EntityNodeData>>) => {
  const colors = getChipColors(data.entityType);
  const isSelected = data.selected;
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg bg-white px-3 py-1.5 text-center transition-shadow"
      style={{
        border: `${isSelected ? 2.5 : 1.5}px solid ${isSelected ? "#1E40AF" : colors.border}`,
        boxShadow: isSelected
          ? "0 4px 14px rgba(30,64,175,0.25)"
          : "0 2px 8px rgba(0,0,0,0.12)",
        minWidth: 64,
      }}
    >
      {/* invisible handles — floating edges compute their own anchor points */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} isConnectable={false} />
      <span
        className="font-bold leading-tight"
        style={{ color: colors.text, fontSize: 11 }}
      >
        {data.label}
      </span>
      {data.entityType && (
        <span
          className="leading-tight"
          style={{ color: colors.typeText, fontSize: 8.5 }}
        >
          {data.entityType}
        </span>
      )}
    </div>
  );
});
EntityNode.displayName = "EntityNode";

/* ------------------------------------------------------------------ */
/*  Floating edge helpers — anchor lines to node borders, any angle   */
/* ------------------------------------------------------------------ */
function getNodeIntersection(intersectionNode: InternalNode<Node>, targetNode: InternalNode<Node>) {
  const w = (intersectionNode.measured.width ?? 0) / 2;
  const h = (intersectionNode.measured.height ?? 0) / 2;
  const x2 = intersectionNode.internals.positionAbsolute.x + w;
  const y2 = intersectionNode.internals.positionAbsolute.y + h;
  const x1 = targetNode.internals.positionAbsolute.x + (targetNode.measured.width ?? 0) / 2;
  const y1 = targetNode.internals.positionAbsolute.y + (targetNode.measured.height ?? 0) / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = 2 * w * (xx3 + yy3) + x2;
  const y = 2 * h * (-xx3 + yy3) + y2;
  return { x, y };
}

function getEdgeParams(source: InternalNode<Node>, target: InternalNode<Node>) {
  const sourceIntersection = getNodeIntersection(source, target);
  const targetIntersection = getNodeIntersection(target, source);
  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
  };
}

const FloatingEdge = ({ id, source, target, markerEnd, style, data }: EdgeProps) => {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  if (!sourceNode || !targetNode) return null;

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  });

  const label = (data as { label?: string } | undefined)?.label;

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: "rgba(255,255,255,0.85)",
              padding: "1px 4px",
              borderRadius: 4,
              fontSize: 8,
              color: "#6B7280",
              pointerEvents: "none",
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

const nodeTypes = { entity: EntityNode };
const edgeTypes = { floating: FloatingEdge };

/* ------------------------------------------------------------------ */
/*  Deterministic radial / concentric layout (replaces d3-force sim)  */
/* ------------------------------------------------------------------ */
function computeLayout(rawNodes: any[], rawLinks: any[]) {
  const adj = new Map<string, string[]>();
  rawNodes.forEach((n) => adj.set(n.id, []));
  rawLinks.forEach((l) => {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    if (adj.has(s)) adj.get(s)!.push(t);
    if (adj.has(t)) adj.get(t)!.push(s);
  });

  // Hub = most-connected node, placed at the centre
  let hub = rawNodes[0];
  let maxConns = -1;
  rawNodes.forEach((n) => {
    const c = adj.get(n.id)!.length;
    if (c > maxConns) {
      maxConns = c;
      hub = n;
    }
  });

  // BFS distance from hub → concentric rings
  const level = new Map<string, number>();
  if (hub) {
    level.set(hub.id, 0);
    const queue = [hub.id];
    while (queue.length) {
      const cur = queue.shift()!;
      const d = level.get(cur)!;
      adj.get(cur)!.forEach((nb) => {
        if (!level.has(nb)) {
          level.set(nb, d + 1);
          queue.push(nb);
        }
      });
    }
  }
  const reachedMax = level.size ? Math.max(...level.values()) : 0;
  rawNodes.forEach((n) => {
    if (!level.has(n.id)) level.set(n.id, reachedMax + 1);
  });

  const byLevel = new Map<number, any[]>();
  rawNodes.forEach((n) => {
    const lv = level.get(n.id)!;
    if (!byLevel.has(lv)) byLevel.set(lv, []);
    byLevel.get(lv)!.push(n);
  });

  const positions = new Map<string, { x: number; y: number }>();
  byLevel.forEach((ns, lv) => {
    if (lv === 0) {
      positions.set(ns[0].id, { x: 0, y: 0 });
      return;
    }
    const radius = lv * 240;
    ns.forEach((n, i) => {
      const angle = (i / ns.length) * 2 * Math.PI - Math.PI / 2;
      positions.set(n.id, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    });
  });
  return positions;
}

/* ------------------------------------------------------------------ */
/*  Floating zoom / fit toolbar (needs ReactFlow context)             */
/* ------------------------------------------------------------------ */
type ToolbarProps = {
  isMaximized: boolean;
  setIsMaximized: (v: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
};

const GraphToolbar = ({ isMaximized, setIsMaximized, isFullscreen, toggleFullscreen }: ToolbarProps) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const btn = "h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors";
  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-1.5 shadow-md hover:shadow-lg hover:border-slate-300/80 transition-all">
      <Button variant="ghost" size="icon" onClick={() => zoomIn({ duration: 300 })} title="Zoom In" className={btn}>
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => zoomOut({ duration: 300 })} title="Zoom Out" className={btn}>
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => fitView({ duration: 400, padding: 0.2 })} title="Fit to Screen" className={btn}>
        <Expand className="h-4 w-4" />
      </Button>
      <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />
      <Button variant="ghost" size="icon" onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "Minimize Panel" : "Maximize Panel"} className={btn}>
        {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"} className={btn}>
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
      </Button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */
export type NetworkGraphProps = {
  nodes: any[];
  links: any[];
  selectedGraphNode: any;
  setSelectedGraphNode: (node: any) => void;
  isMaximized: boolean;
  setIsMaximized: (v: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  setGraphContainer: (el: HTMLDivElement | null) => void;
  renderDetailsPanel: (isOverlay: boolean) => React.ReactNode;
};

const NetworkGraphInner = ({
  nodes,
  links,
  selectedGraphNode,
  setSelectedGraphNode,
  isMaximized,
  setIsMaximized,
  isFullscreen,
  toggleFullscreen,
  setGraphContainer,
  renderDetailsPanel,
}: NetworkGraphProps) => {
  const layout = useMemo(() => computeLayout(nodes, links), [nodes, links]);

  const rfNodes = useMemo<Node<EntityNodeData>[]>(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: "entity",
        position: layout.get(n.id) || { x: 0, y: 0 },
        data: {
          label: n.label || n.id,
          entityType: n.type || "",
          selected: selectedGraphNode?.id === n.id,
        },
      })),
    [nodes, layout, selectedGraphNode],
  );

  const rfEdges = useMemo<Edge[]>(
    () =>
      links.map((l, i) => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        return {
          id: `e-${s}-${t}-${i}`,
          source: s,
          target: t,
          type: "floating",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#CBD5E1", width: 16, height: 16 },
          style: { stroke: "#CBD5E1", strokeWidth: 1.5 },
          data: { label: l.relationship ? l.relationship.replace(/_/g, " ") : "" },
        };
      }),
    [links],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const original = nodes.find((n) => n.id === node.id);
      setSelectedGraphNode(original || node);
    },
    [nodes, setSelectedGraphNode],
  );

  return (
    <div className={`relative w-full flex-grow flex gap-4 ${isMaximized ? "z-[100]" : "z-10"}`}>
      {isMaximized && (
        <div
          className="fixed inset-0 bg-white/70 backdrop-blur-md z-[100] transition-all duration-300 animate-in fade-in"
          onClick={() => setIsMaximized(false)}
        />
      )}
      <div
        className={`border border-border/50 rounded-xl overflow-hidden bg-slate-50/50 transition-all duration-300 flex flex-col ${
          isMaximized
            ? "fixed inset-6 md:inset-12 z-[101] bg-white shadow-2xl border-slate-200 p-4 rounded-2xl"
            : isFullscreen
              ? "fixed inset-0 z-[101] w-full h-full bg-white p-4"
              : `relative h-full flex-grow ${selectedGraphNode ? "w-2/3" : "w-full"}`
        }`}
        ref={setGraphContainer}
      >
        {isMaximized && (
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2">
            <Network className="h-4 w-4 text-indigo-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Dynamic Knowledge Graph (Maximized View)</span>
          </div>
        )}

        <GraphToolbar
          isMaximized={isMaximized}
          setIsMaximized={setIsMaximized}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
        />

        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedGraphNode(null)}
          fitView
          fitViewOptions={{ padding: 0.2, minZoom: 1, maxZoom: 1.6 }}
          minZoom={0.3}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          nodesDraggable={true}
          elementsSelectable={true}
          panOnDrag={true}
          className="bg-transparent"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E2E8F0" />
        </ReactFlow>

        {/* Details panel inside the box when maximized / fullscreen */}
        {(isMaximized || isFullscreen) && renderDetailsPanel(true)}
      </div>

      {/* Details panel as a side-by-side sibling in normal view */}
      {!(isMaximized || isFullscreen) && renderDetailsPanel(false)}
    </div>
  );
};

export const NetworkGraph = (props: NetworkGraphProps) => (
  <ReactFlowProvider>
    <NetworkGraphInner {...props} />
  </ReactFlowProvider>
);

export default NetworkGraph;
