import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Network, Save, Sparkles, HelpCircle, Activity } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { usePathsQuery } from '../hooks/useLearningPaths'
import { 
  useKnowledgeNodesQuery, 
  useSaveKnowledgeNodesMutation, 
  useGenerateKnowledgeNodesMutation 
} from '../hooks/useKnowledgeMap'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function KnowledgeMap() {
  const queryClient = useQueryClient()
  const { data: paths } = usePathsQuery()
  const [selectedPathId, setSelectedPathId] = useState<number | null>(null)
  
  useEffect(() => {
    if (paths && paths.length > 0 && !selectedPathId) {
      setSelectedPathId(paths[0].id)
    }
  }, [paths])

  const { data: nodes, isLoading } = useKnowledgeNodesQuery(selectedPathId || 0)
  const saveNodesMutation = useSaveKnowledgeNodesMutation(selectedPathId || 0)
  const generateNodesMutation = useGenerateKnowledgeNodesMutation(selectedPathId || 0)

  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null)
  const [draggedNodeId, setDraggedNodeId] = useState<number | null>(null)
  
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleGenerateNodes = () => {
    if (!selectedPathId) return
    generateNodesMutation.mutate()
  }

  const handleSaveMap = () => {
    if (!nodes) return
    saveNodesMutation.mutate(nodes)
  }

  // Parse JSON safe
  const parseJsonSafe = (str: string | null) => {
    if (!str) return []
    try {
      return JSON.parse(str)
    } catch {
      return []
    }
  }

  // Handle Dragging
  const handleMouseDown = (nodeId: number) => {
    setDraggedNodeId(nodeId)
    setSelectedNodeId(nodeId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId === null || !nodes || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    
    // Scale coordinates appropriately
    const x = Math.max(20, Math.min(rect.width - 20, e.clientX - rect.left))
    const y = Math.max(20, Math.min(rect.height - 20, e.clientY - rect.top))

    // Update the position locally in the query cache
    const updatedNodes = nodes.map(n => {
      if (n.id === draggedNodeId) {
        return { ...n, x, y }
      }
      return n
    })
    queryClient.setQueryData(['knowledge-nodes', selectedPathId], updatedNodes)
  }

  const handleMouseUp = () => {
    setDraggedNodeId(null)
  }

  const selectedNode = nodes?.find(n => n.id === selectedNodeId)

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-cairo">خريطة المعرفة التفاعلية 🗺️</h1>
          <p className="text-gray-400 text-sm mt-1">تتبع هيكل ومستويات إتقان مفاهيم مسارات دراستك هندسياً وبصرياً</p>
        </div>

        {/* Path Selector */}
        <div className="flex gap-3 items-center w-full md:w-auto">
          <select 
            className="bg-[#1a1d27] border border-[#2d3252] rounded-xl text-white text-xs h-10 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-cairo min-w-[200px]"
            value={selectedPathId || ''}
            onChange={(e) => setSelectedPathId(Number(e.target.value))}
          >
            {paths?.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          
          {nodes && nodes.length > 0 && (
            <Button 
              variant="secondary"
              size="sm"
              className="h-10 text-xs font-cairo"
              icon={<Save className="h-4 w-4" />}
              onClick={handleSaveMap}
              isLoading={saveNodesMutation.isPending}
            >
              حفظ توزيع المفاهيم
            </Button>
          )}
        </div>
      </div>

      {!selectedPathId ? (
        <Card className="glass p-12 text-center text-gray-500 border border-dashed border-dark-border max-w-xl mx-auto mt-8 flex flex-col items-center justify-center space-y-3">
          <Network className="h-16 w-16 text-indigo-500/20" />
          <h3 className="text-lg font-bold text-white font-cairo">لا توجد مسارات تعلم نشطة</h3>
          <p className="text-xs">يرجى البدء بإنشاء مسار تعلم أولاً لكي تظهر خريطته المعرفية هنا.</p>
        </Card>
      ) : isLoading ? (
        <div className="text-center py-12 text-gray-400">جاري تحميل عقد خريطة المعرفة...</div>
      ) : !nodes || nodes.length === 0 ? (
        // NO NODES AUTO GENERATE BANNER
        <Card className="glass p-12 text-center text-gray-400 border border-dashed border-dark-border max-w-xl mx-auto my-auto flex flex-col items-center justify-center space-y-4">
          <Network className="h-16 w-16 text-indigo-500/30 animate-pulse" />
          <h3 className="text-lg font-bold text-white font-cairo">لم يتم بناء شبكة مفاهيم هذا المسار بعد</h3>
          <p className="text-xs">يقوم الذكاء الاصطناعي بتحليل دروس الكورس وبناء شبكة علاقات هندسية بينها لمساعدتك على الفهم المترابط.</p>
          <Button 
            variant="primary" 
            icon={<Sparkles className="h-4 w-4" />} 
            onClick={handleGenerateNodes}
            isLoading={generateNodesMutation.isPending}
          >
            توليد خريطة المفاهيم تلقائياً 🤖
          </Button>
        </Card>
      ) : (
        // INTERACTIVE MAP GRID
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 grow min-h-[500px]">
          {/* Node Canvas Area */}
          <div className="lg:col-span-3 flex flex-col space-y-2 h-full min-h-[450px]">
            <div className="flex justify-between items-center text-xs text-gray-400 font-tajawal">
              <span>تلميح: اضغط واسحب العقد لإعادة توزيعها، ثم احفظ التغييرات.</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />متقن (80%+)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />تعلمته (40%+)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />يحتاج مراجعة</span>
              </div>
            </div>

            <div 
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="grow bg-[#131620] border border-[#2d3252]/40 rounded-3xl relative overflow-hidden shadow-inner cursor-crosshair h-full"
            >
              {/* Lines Connectors (Drawn behind nodes) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {nodes.map((n) => {
                  const connections = parseJsonSafe(n.connections) as number[]
                  return connections.map((connId) => {
                    const target = nodes.find(item => item.id === connId)
                    if (!target) return null
                    
                    return (
                      <line 
                        key={`${n.id}-${connId}`}
                        x1={n.x} 
                        y1={n.y} 
                        x2={target.x} 
                        y2={target.y} 
                        stroke="#2d3252" 
                        strokeWidth="1.5" 
                        strokeDasharray="4"
                      />
                    )
                  })
                })}
              </svg>

              {/* Concept Node Elements */}
              {nodes.map((node) => {
                const mastery = node.mastery || 0
                const isSelected = selectedNodeId === node.id
                
                // Color based on mastery
                const color = mastery >= 0.8 
                  ? '#10b981' // Green
                  : mastery >= 0.4 
                    ? '#f59e0b' // Yellow
                    : '#ef4444' // Red

                return (
                  <motion.div
                    key={node.id}
                    className="absolute"
                    style={{ left: node.x - 24, top: node.y - 24 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div 
                      onMouseDown={() => handleMouseDown(node.id)}
                      className={`h-12 w-12 rounded-full bg-dark-surface border-2 flex items-center justify-center cursor-pointer shadow-lg transition-shadow relative ${isSelected ? 'shadow-indigo-500/20 scale-105' : 'hover:shadow-indigo-500/10'}`}
                      style={{ borderColor: color }}
                      title={node.concept}
                    >
                      <Activity className="h-4.5 w-4.5 text-white" style={{ color }} />
                      
                      {/* Node Label Tooltip */}
                      <span className="absolute top-14 bg-dark-surface/90 text-[10px] text-gray-200 px-2 py-0.5 rounded border border-[#2d3252] shadow whitespace-nowrap font-cairo select-none pointer-events-none">
                        {node.concept}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Node Details Panel */}
          <div className="lg:col-span-1">
            {selectedNode ? (
              <Card className="glass p-5 border border-dark-border space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span 
                      className="text-[9px] font-bold font-cairo bg-indigo-500/10 px-2 py-0.5 rounded-md text-white"
                      style={{ color: selectedNode.mastery >= 0.8 ? '#10b981' : selectedNode.mastery >= 0.4 ? '#f59e0b' : '#ef4444' }}
                    >
                      إتقان المفهوم: {Math.round(selectedNode.mastery * 100)}%
                    </span>
                    <h3 className="text-base font-bold text-white font-cairo mt-2">{selectedNode.concept}</h3>
                  </div>

                  <p className="text-xs text-gray-300 font-tajawal select-text leading-relaxed">{selectedNode.description || 'لا يوجد تفاصيل تفصيلية لهذا المفهوم. يمكنك إثراء الشرح الخاص به عبر كتابة تقييم Feynman.'}</p>

                  <div className="border-t border-[#2d3252]/40 pt-4 space-y-2">
                    <span className="text-[10px] text-gray-400 block font-tajawal">مستوى الإتقان العلمي</span>
                    <div className="flex items-center gap-2">
                      <div className="grow bg-[#131620] h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.round(selectedNode.mastery * 100)}%`,
                            backgroundColor: selectedNode.mastery >= 0.8 ? '#10b981' : selectedNode.mastery >= 0.4 ? '#f59e0b' : '#ef4444' 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2d3252]/40 space-y-2 shrink-0">
                  <div className="text-[10px] text-gray-400 font-tajawal">
                    روابط المفاهيم المجاورة: {parseJsonSafe(selectedNode.connections).length} مفاهيم
                  </div>
                </div>
              </Card>
            ) : (
              <div className="text-center p-6 text-gray-500 border border-dashed border-[#2d3252] rounded-3xl h-full flex flex-col items-center justify-center">
                <HelpCircle className="h-10 w-10 text-gray-600 mb-2 animate-bounce" />
                <p className="text-xs font-tajawal">اختر مفهوماً من الخريطة لعرض تفاصيله ونسبة إتقانه العلمي.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
