import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  FileText, 
  Database, 
  TrendingUp, 
  GitCompare, 
  ShieldCheck, 
  Award, 
  FileCheck, 
  UserCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { api } from '../services/api';
import { EvidenceNode, EvidenceEdge } from '../types';

export const EvidenceGraphPage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const caseId = params.id || 'LL-9041';

  const [nodes, setNodes] = useState<EvidenceNode[]>([]);
  const [edges, setEdges] = useState<EvidenceEdge[]>([]);
  const [loading, setLoading] = useState(true);

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Selected Node Drawer
  const [selectedNode, setSelectedNode] = useState<EvidenceNode | null>(null);

  useEffect(() => {
    loadGraph();
  }, [caseId]);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await api.getEvidenceGraph(caseId);
      setNodes(data.nodes);
      setEdges(data.edges);
      // Select first node as default preview
      if (data.nodes.length > 0) setSelectedNode(data.nodes[2]); // Cash Flow Agent by default
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking canvas background, not a node
    if ((e.target as HTMLElement).closest('.graph-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 40, y: 30 });
  };

  const getNodeIcon = (iconName?: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-4 h-4 text-primary" />;
      case 'Database':
        return <Database className="w-4 h-4 text-indigo-500" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'GitCompare':
        return <GitCompare className="w-4 h-4 text-blue-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'Award':
        return <Award className="w-4 h-4 text-purple-500" />;
      case 'FileCheck':
        return <FileCheck className="w-4 h-4 text-emerald-500" />;
      case 'UserCheck':
        return <UserCheck className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Cases' },
          { label: `Case ${caseId}`, href: `/cases/${caseId}` },
          { label: 'Interactive Multi-Agent Evidence Graph' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Underwriting Agent Evidence Graph
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-blue-50 dark:bg-blue-950/40 text-primary border border-blue-200 dark:border-blue-900">
              Interactive Flow
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Trace autonomous decision lineage from ingested PDF dossiers through AI agents to Credit Assessment Memorandum.
          </p>
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setZoom(z => Math.min(1.8, z + 0.15))}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono px-2 text-gray-500 select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Reset Canvas"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Graph Canvas & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Interactive Canvas (8 cols) */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`lg:col-span-8 relative bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-soft ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          } select-none`}
          style={{ height: '580px' }}
        >
          {/* Subtle Grid Background Pattern */}
          <div
            className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#1E88E5 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Canvas Transform Layer */}
          <div
            className="absolute inset-0 transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: '1600px',
              height: '520px',
            }}
          >
            {/* SVG Connecting Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1E88E5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1E88E5" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              {edges.map(edge => {
                const source = nodes.find(n => n.id === edge.from);
                const target = nodes.find(n => n.id === edge.to);
                if (!source || !target) return null;

                const sx = source.x + 190;
                const sy = source.y + 36;
                const tx = target.x;
                const ty = target.y + 36;
                const mx = (sx + tx) / 2;

                return (
                  <g key={edge.id}>
                    <path
                      d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`}
                      fill="none"
                      stroke="url(#edgeGrad)"
                      strokeWidth={2}
                      strokeDasharray={edge.animated ? '5,5' : 'none'}
                      className={edge.animated ? 'animate-pulse' : ''}
                    />
                    {/* Directional arrowhead */}
                    <circle cx={tx - 4} cy={ty} r={3} fill="#1E88E5" />
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map(node => {
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  className={`graph-node absolute z-10 w-48 p-3.5 rounded-xl border transition-all duration-150 cursor-pointer shadow-soft hover:shadow-soft-md ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/80 border-primary ring-2 ring-primary/30 shadow-glow-primary scale-105'
                      : 'bg-white/95 dark:bg-gray-900/95 border-gray-200 dark:border-gray-800 hover:border-primary/50'
                  }`}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                      {getNodeIcon(node.iconName)}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                      {node.confidence}% Conf.
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                    {node.label}
                  </h4>
                  {node.subtitle && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {node.subtitle}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Watermark instruction in bottom corner */}
          <div className="absolute bottom-3 left-3 text-[11px] text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-900/80 px-2.5 py-1 rounded-lg backdrop-blur-sm pointer-events-none border border-gray-100 dark:border-gray-800">
            Click any node to inspect agent logs • Drag canvas to pan
          </div>
        </div>

        {/* Inspector Side Drawer (4 cols) */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Node Inspector
                </CardTitle>
                {selectedNode && (
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-5 flex-1 overflow-y-auto space-y-4">
              {selectedNode ? (
                <>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedNode.label}
                    </h3>
                    <p className="text-xs text-primary font-medium mt-0.5">
                      {selectedNode.details.source}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Timestamp: {selectedNode.details.verifiedAt}
                    </p>
                  </div>

                  {/* Metrics Box */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2">
                      Agent Output Metrics
                    </h5>
                    <div className="space-y-2">
                      {selectedNode.details.metrics.map((m, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs"
                        >
                          <span className="text-gray-500 dark:text-gray-400">{m.label}</span>
                          <span className="font-bold text-gray-900 dark:text-white font-mono">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes / Explanation */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">
                      Autonomous Audit Notes
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-blue-50/40 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40">
                      {selectedNode.details.notes}
                    </p>
                  </div>

                  {/* Cryptographic Seal */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-2.5 text-xs text-gray-500">
                    <Lock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-[11px]">
                        Verifiable Decision Cryptohash
                      </div>
                      <div className="font-mono text-[10px] text-gray-400 truncate">
                        0x88f2a1b9c488310d7e52a9f145b367d2
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400 text-xs">
                  Select a graph node to view detailed audit logs and metrics.
                </div>
              )}
            </CardContent>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate(`/cases/${caseId}/audit`)}
              >
                Inspect Step-by-Step Audit Timeline →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
