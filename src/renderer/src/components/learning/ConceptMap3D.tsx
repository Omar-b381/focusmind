import { useEffect, useRef, useState } from 'react'
import { Info, RotateCw } from 'lucide-react'


interface Node3D {
  id: string
  label: string
  val: number
  group: number
  description?: string
  // 3D coordinates
  x: number
  y: number
  z: number
  // Rotated coordinates
  rx?: number
  ry?: number
  rz?: number
  // Screen projected coordinates
  sx?: number
  sy?: number
}

interface Link3D {
  source: string
  target: string
  sourceNode?: Node3D
  targetNode?: Node3D
}

interface ConceptMap3DProps {
  conceptMap: {
    nodes: Array<{ id: string; label: string; val: number; group: number; description?: string }>
    links: Array<{ source: string; target: string }>
  }
  onSelectNode?: (node: { id: string; label: string; description?: string }) => void
}

export default function ConceptMap3D({ conceptMap, onSelectNode }: ConceptMap3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  const [nodes, setNodes] = useState<Node3D[]>([])
  const [links, setLinks] = useState<Link3D[]>([])
  const [hoveredNode, setHoveredNode] = useState<Node3D | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null)

  // Rotation angles
  const angleX = useRef<number>(0.1)
  const angleY = useRef<number>(0.2)
  
  // Drag state
  const isDragging = useRef<boolean>(false)
  const lastMouseX = useRef<number>(0)
  const lastMouseY = useRef<number>(0)
  const dragDistance = useRef<number>(0)

  // Colors for groups (ADHD friendly glowing neons)
  const groupColors = [
    '#6366f1', // Indigo (Center)
    '#f97316', // Orange (Group 1)
    '#10b981', // Emerald (Group 2)
    '#a855f7', // Purple (Group 3)
    '#ec4899', // Pink (Group 4)
    '#06b6d4'  // Cyan (Group 5)
  ]

  // Initialize 3D positions
  useEffect(() => {
    if (!conceptMap || !conceptMap.nodes) return

    const initialNodes: Node3D[] = conceptMap.nodes.map((node, index) => {
      // Calculate 3D sphere distribution (Fibonacci grid)
      const total = conceptMap.nodes.length
      
      // Place center node exactly at (0,0,0)
      if (node.group === 0 || index === 0) {
        return {
          ...node,
          x: 0,
          y: 0,
          z: 0
        }
      }

      const phi = Math.acos(-1 + (2 * index) / total)
      const theta = Math.sqrt(total * Math.PI) * phi
      
      // Radius of the 3D map
      const r = 90 + (node.val === 6 ? 40 : 0) // expand outer child nodes slightly
      
      return {
        ...node,
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi)
      }
    })

    const initialLinks: Link3D[] = conceptMap.links.map(link => {
      return {
        source: link.source,
        target: link.target
      }
    })

    setNodes(initialNodes)
    setLinks(initialLinks)
    setHoveredNode(null)
    setSelectedNode(initialNodes.find(n => n.group === 0) || initialNodes[0] || null)
  }, [conceptMap])

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    // Render loop
    const render = () => {
      if (!ctx || !canvas) return

      // Dynamic resizing
      const rect = canvas.getBoundingClientRect()
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width
        canvas.height = rect.height
      }

      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Perspective settings
      const fov = 350

      // Auto rotation (slow float when not dragging)
      if (!isDragging.current) {
        angleY.current += 0.002
        angleX.current += 0.0005
      }

      // Precalculate Sin/Cos for rotations
      const cosX = Math.cos(angleX.current)
      const sinX = Math.sin(angleX.current)
      const cosY = Math.cos(angleY.current)
      const sinY = Math.sin(angleY.current)

      // Rotate and project all nodes
      const projectedNodes = nodes.map(node => {
        // Rotate around Y axis
        let rx = node.x * cosY - node.z * sinY
        let rz = node.x * sinY + node.z * cosY

        // Rotate around X axis
        let ry = node.y * cosX - rz * sinX
        let rzFinal = node.y * sinX + rz * cosX

        // Project onto 2D viewport
        const scale = fov / (fov + rzFinal)
        const sx = centerX + rx * scale
        const sy = centerY + ry * scale

        return {
          ...node,
          rx,
          ry,
          rz: rzFinal,
          sx,
          sy,
          scale
        }
      })

      // Sort nodes by depth (painter's algorithm) so elements behind are drawn first
      projectedNodes.sort((a, b) => b.rz - a.rz)

      // Map links to source/target nodes
      const projectedLinks = links.map(link => {
        const sourceNode = projectedNodes.find(n => n.id === link.source)
        const targetNode = projectedNodes.find(n => n.id === link.target)
        return {
          ...link,
          sourceNode,
          targetNode
        }
      })

      // 1. Draw Links
      projectedLinks.forEach(link => {
        if (!link.sourceNode || !link.targetNode) return
        const s = link.sourceNode
        const t = link.targetNode

        // Calculate line transparency based on depth of both nodes
        const avgZ = (s.rz + t.rz) / 2
        // Map average depth to opacity
        const opacity = Math.max(0.08, Math.min(0.6, 1 - (avgZ + 150) / 300))

        ctx.beginPath()
        ctx.moveTo(s.sx!, s.sy!)
        ctx.lineTo(t.sx!, t.sy!)
        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`
        ctx.lineWidth = 1.2 * ((s.scale + t.scale) / 2)
        ctx.stroke()
      })

      // 2. Draw Nodes
      projectedNodes.forEach(node => {
        const radius = Math.max(4, (node.val === 20 ? 12 : node.val === 12 ? 8 : 5) * node.scale)
        const color = groupColors[node.group % groupColors.length]
        
        ctx.beginPath()
        ctx.arc(node.sx!, node.sy!, radius, 0, Math.PI * 2)

        // Draw shadow glow for active/hovered/center nodes
        const isHovered = hoveredNode && hoveredNode.id === node.id
        const isSelected = selectedNode && selectedNode.id === node.id
        
        if (node.group === 0 || isHovered || isSelected) {
          ctx.shadowColor = color
          ctx.shadowBlur = isHovered || isSelected ? 16 : 8
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = color
        ctx.fill()
        
        // Reset shadow
        ctx.shadowBlur = 0

        // Highlight ring around hovered or selected node
        if (isHovered || isSelected) {
          ctx.beginPath()
          ctx.arc(node.sx!, node.sy!, radius + 4, 0, Math.PI * 2)
          ctx.strokeStyle = isSelected ? '#ffffff' : color
          ctx.lineWidth = 1.2
          ctx.stroke()
        }

        // Draw labels for large nodes or hovered node
        const shouldShowLabel = node.group === 0 || node.val === 12 || isHovered || isSelected
        if (shouldShowLabel) {
          ctx.font = `${isHovered || isSelected ? 'bold 11px' : '10px'} Cairo, sans-serif`
          ctx.fillStyle = isHovered || isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.75)'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          
          // Draw tiny text backdrop for readability
          const textY = node.sy! + radius + 4
          const text = node.label
          
          ctx.fillText(text, node.sx!, textY)
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [nodes, links, hoveredNode, selectedNode])

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true
    lastMouseX.current = e.clientX
    lastMouseY.current = e.clientY
    dragDistance.current = 0
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (isDragging.current) {
      const dx = e.clientX - lastMouseX.current
      const dy = e.clientY - lastMouseY.current
      
      angleY.current += dx * 0.005
      angleX.current -= dy * 0.005
      
      lastMouseX.current = e.clientX
      lastMouseY.current = e.clientY
      dragDistance.current += Math.sqrt(dx * dx + dy * dy)
      return
    }

    // Hover check (Ray-casting)
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    // Project nodes on current orientation to check hover distance
    const fov = 350
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const cosX = Math.cos(angleX.current)
    const sinX = Math.sin(angleX.current)
    const cosY = Math.cos(angleY.current)
    const sinY = Math.sin(angleY.current)

    let closestNode: Node3D | null = null
    let minDistance = 15 // hover tolerance radius in pixels

    nodes.forEach(node => {
      let rx = node.x * cosY - node.z * sinY
      let rz = node.x * sinY + node.z * cosY
      let ry = node.y * cosX - rz * sinX
      let rzFinal = node.y * sinX + rz * cosX

      const scale = fov / (fov + rzFinal)
      const sx = centerX + rx * scale
      const sy = centerY + ry * scale

      const dist = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2)
      if (dist < minDistance) {
        minDistance = dist
        closestNode = node
      }
    })

    setHoveredNode(closestNode)
  }

  const handleMouseUp = () => {
    isDragging.current = false
    
    // Click event trigger if mouse barely moved
    if (dragDistance.current < 4 && hoveredNode) {
      setSelectedNode(hoveredNode)
      if (onSelectNode) {
        onSelectNode({
          id: hoveredNode.id,
          label: hoveredNode.label,
          description: hoveredNode.description
        })
      }
    }
  }

  const handleResetOrientation = () => {
    angleX.current = 0.1
    angleY.current = 0.2
  }

  return (
    <div className="relative w-full h-[320px] bg-[#141621]/60 border border-[#2d3252]/40 rounded-2xl overflow-hidden flex flex-col">
      <div className="absolute top-3 right-3 z-10 flex items-center justify-between w-full px-6 select-none pointer-events-none">
        <div className="flex items-center gap-1.5 bg-[#1a1d27]/70 border border-[#2d3252]/50 px-2 py-1 rounded-lg pointer-events-auto">
          <Info className="h-3 w-3 text-indigo-400" />
          <span className="text-[10px] text-gray-300 font-tajawal">اسحب لتدوير المجرة 3D</span>
        </div>
        <button
          onClick={handleResetOrientation}
          title="إعادة التوجيه"
          className="p-1.5 bg-[#1a1d27]/70 border border-[#2d3252]/50 hover:bg-[#1a1d27] rounded-lg text-gray-400 hover:text-white transition pointer-events-auto flex items-center justify-center"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          isDragging.current = false
          setHoveredNode(null)
        }}
        className="w-full flex-1 cursor-grab active:cursor-grabbing"
      />

      {/* Active Concept Info Card */}
      {selectedNode && (
        <div className="p-3 bg-[#1a1d27]/85 border-t border-[#2d3252]/40 text-right animate-slide-up select-none">
          <div className="flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse-soft"
              style={{ backgroundColor: groupColors[selectedNode.group % groupColors.length] }}
            />
            <h4 className="text-xs font-bold text-white font-cairo truncate">{selectedNode.label}</h4>
          </div>
          {selectedNode.description && (
            <p className="text-[10px] text-gray-400 mt-1 font-tajawal line-clamp-2 leading-relaxed">
              {selectedNode.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
