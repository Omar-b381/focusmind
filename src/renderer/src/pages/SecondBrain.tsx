import { useState, useMemo } from 'react'
import { 
  useNotesQuery, 
  useNoteQuery, 
  useCreateNoteMutation, 
  useUpdateNoteMutation, 
  useDeleteNoteMutation,
  useBacklinksQuery,
  useSuggestLinksQuery
} from '../hooks/useSecondBrain'
import { useNotesStore } from '../stores/notes.store'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { 
  Search, Plus, Trash2, Link as LinkIcon, 
  Sparkles, Network, BookOpen, Compass
} from 'lucide-react'

export default function SecondBrain() {
  const {
    selectedNoteId,
    setSelectedNoteId,
    currentArea,
    setCurrentArea,
    searchQuery,
    setSearchQuery
  } = useNotesStore()

  const [isEditing, setIsEditing] = useState(false)
  const [editorTitle, setEditorTitle] = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [editorArea, setEditorArea] = useState('uncategorized')
  const [editorEmoji, setEditorEmoji] = useState('📝')
  const [editorTags, setEditorTags] = useState('')
  const [showGraph, setShowGraph] = useState(false)

  // Queries
  const { data: allNotes = [], isLoading: isNotesLoading } = useNotesQuery()
  const { data: currentNote } = useNoteQuery(selectedNoteId)
  const { data: backlinks = [] } = useBacklinksQuery(selectedNoteId)
  const { data: suggestions = [] } = useSuggestLinksQuery(
    selectedNoteId,
    selectedNoteId ? currentNote?.content || '' : ''
  )

  // Mutations
  const createNoteMutation = useCreateNoteMutation()
  const updateNoteMutation = useUpdateNoteMutation()
  const deleteNoteMutation = useDeleteNoteMutation()

  // Filter notes based on P.A.R.A category and search query
  const filteredNotes = useMemo(() => {
    return allNotes.filter(note => {
      const matchesArea = currentArea === 'all' || note.area === currentArea
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesArea && matchesSearch
    })
  }, [allNotes, currentArea, searchQuery])

  // Simple wiki-link parser to add links
  const processedMarkdown = useMemo(() => {
    if (!currentNote) return ''
    let text = currentNote.content
    // Replace [[Wiki Link]] with a custom link-looking styled text
    text = text.replace(/\[\[([^\]]+)\]\]/g, (_, p1) => {
      const match = allNotes.find(n => n.title.trim().toLowerCase() === p1.trim().toLowerCase())
      if (match) {
        return `<span class="text-indigo-400 font-semibold underline cursor-pointer" onclick="window.selectSecondBrainNote(${match.id})">${p1}</span>`
      }
      return `<span class="text-gray-500 font-semibold border-b border-dashed border-gray-600">${p1}</span>`
    })
    return text
  }, [currentNote, allNotes])

  // Attach global handler so clicking on wiki-links inside raw markdown previews works
  if (typeof window !== 'undefined') {
    (window as any).selectSecondBrainNote = (id: number) => {
      setSelectedNoteId(id)
      setIsEditing(false)
    }
  }

  const handleSelectNote = (id: number) => {
    setSelectedNoteId(id)
    setIsEditing(false)
  }

  const handleStartEdit = () => {
    if (!currentNote) return
    setEditorTitle(currentNote.title)
    setEditorContent(currentNote.content)
    setEditorArea(currentNote.area)
    setEditorEmoji(currentNote.emoji || '📝')
    try {
      const tagsArr = JSON.parse(currentNote.tags || '[]')
      setEditorTags(tagsArr.join(', '))
    } catch {
      setEditorTags('')
    }
    setIsEditing(true)
  }

  const handleSaveNote = async () => {
    if (!editorTitle.trim()) return
    const tagsArr = editorTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
    
    const noteData = {
      title: editorTitle,
      content: editorContent,
      area: editorArea,
      emoji: editorEmoji,
      tags: JSON.stringify(tagsArr)
    }

    if (selectedNoteId) {
      await updateNoteMutation.mutateAsync({ id: selectedNoteId, note: noteData })
    } else {
      const created = await createNoteMutation.mutateAsync(noteData)
      setSelectedNoteId(created.id)
    }
    setIsEditing(false)
  }

  const handleCreateNew = () => {
    setSelectedNoteId(null)
    setEditorTitle('ملاحظة جديدة')
    setEditorContent('')
    setEditorArea('uncategorized')
    setEditorEmoji('📝')
    setEditorTags('')
    setIsEditing(true)
  }

  const handleDelete = async () => {
    if (!selectedNoteId) return
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه الملاحظة؟')) {
      await deleteNoteMutation.mutateAsync(selectedNoteId)
      setSelectedNoteId(null)
      setIsEditing(false)
    }
  }

  // Draw interactive SVG node links graph of notes
  const graphData = useMemo(() => {
    const nodes = allNotes.map((note, index) => {
      // Calculate angular positions in circular layout
      const angle = (index / allNotes.length) * 2 * Math.PI
      const r = 160
      return {
        id: note.id,
        title: note.title,
        emoji: note.emoji || '📝',
        x: 250 + r * Math.cos(angle),
        y: 200 + r * Math.sin(angle)
      }
    })

    // Simulated connections: we can fetch links if note links table is parsed
    // Or we can extract wiki-links on client side
    const links: { sourceX: number; sourceY: number; targetX: number; targetY: number }[] = []
    
    allNotes.forEach(note => {
      const sourceNode = nodes.find(n => n.id === note.id)
      if (!sourceNode) return

      // Extract wiki links from content
      const regex = /\[\[([^\]]+)\]\]/g
      let match
      while ((match = regex.exec(note.content)) !== null) {
        const title = match[1].trim().toLowerCase()
        const targetNode = nodes.find(n => n.title.trim().toLowerCase() === title)
        if (targetNode && targetNode.id !== note.id) {
          links.push({
            sourceX: sourceNode.x,
            sourceY: sourceNode.y,
            targetX: targetNode.x,
            targetY: targetNode.y
          })
        }
      }
    })

    return { nodes, links }
  }, [allNotes])

  return (
    <div className="h-full flex flex-col font-tajawal text-gray-200">
      {/* Top Header */}
      <div className="flex justify-between items-center p-6 border-b border-[#2d3252]/80 bg-[#131620] shrink-0">
        <div>
          <h2 className="text-2xl font-bold font-cairo text-white flex items-center gap-2">
            <span>🧠 الدماغ الثاني</span>
            <span className="text-xs font-normal text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              PARA Method
            </span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">تفريغ واسترجاع المعرفة وعلاج ضعف ذاكرة العمل التنفيذية</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={showGraph ? 'primary' : 'secondary'} 
            icon={<Network className="h-4 w-4" />} 
            onClick={() => setShowGraph(!showGraph)}
          >
            {showGraph ? 'عرض المستند' : 'خريطة الأفكار'}
          </Button>
          <Button variant="dopamine" icon={<Plus className="h-4 w-4" />} onClick={handleCreateNew}>
            ملاحظة جديدة
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Notes List Sidebar */}
        <div className="w-80 border-l border-[#2d3252]/60 bg-[#151924]/80 flex flex-col shrink-0">
          <div className="p-4 space-y-3 border-b border-[#2d3252]/40 bg-[#131620]/50">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="ابحث في ملاحظاتك..." 
                className="pr-10 pl-3 h-10 w-full"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {/* PARA Category Pill Filter */}
            <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'projects', label: 'المشاريع' },
                { id: 'areas', label: 'المجالات' },
                { id: 'resources', label: 'المراجع' },
                { id: 'archive', label: 'الأرشيف' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentArea(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                    currentArea === tab.id 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-[#1c2030] text-gray-400 hover:bg-[#252a40]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
            {isNotesLoading ? (
              <div className="text-center py-8 text-gray-500">جاري تحميل الملاحظات...</div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">لا توجد ملاحظات مطابقة.</div>
            ) : (
              filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedNoteId === note.id
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/5'
                      : 'bg-[#1c2030]/40 border-[#2d3252]/40 hover:bg-[#21253a]/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-lg">{note.emoji || '📝'}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                      {note.area === 'projects' ? 'مشروع' : note.area === 'areas' ? 'مجال' : note.area === 'resources' ? 'مرجع' : 'عام'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-1 font-tajawal leading-snug">{note.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {note.content.replace(/[#*`_[\]]/g, '')}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Note Editor / Preview or Graph Area */}
        <div className="flex-1 bg-[#0f1117] flex overflow-hidden">
          {showGraph ? (
            /* Animated SVG Note Graph Map */
            <div className="flex-1 relative flex flex-col justify-center items-center p-6 bg-[#0f1117]">
              <div className="absolute top-4 right-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 max-w-xs text-xs">
                <h5 className="font-bold text-white flex items-center gap-1.5 mb-1 text-indigo-400">
                  <Compass className="h-3.5 w-3.5" />
                  خريطة الأفكار التفاعلية
                </h5>
                <p className="text-gray-400">
                  شبكة ذكية توضح الروابط ثنائية الاتجاه المكتشفة تلقائياً في ملاحظاتك. اضغط على أي عقدة لفتح مستندها.
                </p>
              </div>
              
              <svg className="w-full h-full max-w-2xl max-h-[500px]" viewBox="0 0 500 400">
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Render Links */}
                {graphData.links.map((link, idx) => (
                  <line
                    key={idx}
                    x1={link.sourceX}
                    y1={link.sourceY}
                    x2={link.targetX}
                    y2={link.targetY}
                    stroke="#4f46e5"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    strokeDasharray="4 2"
                  />
                ))}

                {/* Render Nodes */}
                {graphData.nodes.map(node => (
                  <g 
                    key={node.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedNoteId(node.id)
                      setShowGraph(false)
                      setIsEditing(false)
                    }}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="18"
                      fill="#1a1d27"
                      stroke={selectedNoteId === node.id ? '#6366f1' : '#2d3252'}
                      strokeWidth="2"
                      filter={selectedNoteId === node.id ? 'url(#glow)' : ''}
                      className="transition-all duration-300 group-hover:stroke-indigo-400"
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      className="text-sm select-none"
                    >
                      {node.emoji}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 30}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      className="text-[10px] font-tajawal font-bold opacity-80 group-hover:fill-indigo-400 transition-colors"
                    >
                      {node.title}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          ) : selectedNoteId || isEditing ? (
            /* Editing or Detail Panel */
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col border-l border-[#2d3252]/40 overflow-hidden">
                {isEditing ? (
                  /* Editor Mode */
                  <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto scrollbar-thin">
                    <div className="flex gap-4">
                      {/* Emoji Picker Placeholder */}
                      <input 
                        type="text"
                        className="w-12 h-12 rounded-xl bg-[#1c2030] text-xl text-center border border-[#2d3252]"
                        value={editorEmoji}
                        onChange={e => setEditorEmoji(e.target.value)}
                      />
                      <Input
                        placeholder="عنوان الملاحظة المعرفية..."
                        className="flex-1 h-12 text-lg font-bold"
                        value={editorTitle}
                        onChange={e => setEditorTitle(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3">
                      <select
                        className="h-10 rounded-xl bg-[#1c2030] border border-[#2d3252] text-sm text-gray-300 px-3 pr-8 focus:ring-indigo-500"
                        value={editorArea}
                        onChange={e => setEditorArea(e.target.value)}
                      >
                        <option value="uncategorized">اختر تصنيف PARA...</option>
                        <option value="projects">Projects (المشاريع الفعالة)</option>
                        <option value="areas">Areas (المسؤوليات المستمرة)</option>
                        <option value="resources">Resources (المراجع والاهتمامات)</option>
                        <option value="archive">Archive (الأرشيف المعلق)</option>
                      </select>
                      <Input
                        placeholder="الوسوم (مفصولة بفواصل)..."
                        className="flex-1 h-10 text-sm"
                        value={editorTags}
                        onChange={e => setEditorTags(e.target.value)}
                      />
                    </div>

                    <textarea
                      placeholder="اكتب أفكارك ومعرفتك بلغة المارك داون هنا... يمكنك ربط ملاحظات أخرى بكتابة [[اسم الملاحظة]]"
                      className="flex-1 w-full bg-[#151924]/60 border border-[#2d3252]/60 rounded-2xl p-4 font-mono text-sm leading-relaxed text-gray-200 focus:outline-none focus:border-indigo-500 scrollbar-thin resize-none min-h-[250px]"
                      value={editorContent}
                      onChange={e => setEditorContent(e.target.value)}
                    />

                    <div className="flex gap-3 pt-2 justify-end">
                      <Button variant="ghost" onClick={() => setIsEditing(false)}>إلغاء</Button>
                      <Button variant="primary" onClick={handleSaveNote}>حفظ الملاحظة 💾</Button>
                    </div>
                  </div>
                ) : (
                  /* Viewer Mode */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 bg-[#131620]/40 border-b border-[#2d3252]/40 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{currentNote?.emoji}</span>
                        <div>
                          <h3 className="text-xl font-bold font-cairo text-white">{currentNote?.title}</h3>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                            <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                              {currentNote?.area}
                            </span>
                            <span>•</span>
                            <span>{currentNote && new Date(currentNote.createdAt).toLocaleString('ar-SA')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" icon={<Trash2 className="h-4 w-4" />} onClick={handleDelete} />
                        <Button variant="primary" onClick={handleStartEdit}>تعديل الملاحظة</Button>
                      </div>
                    </div>

                    {/* Markdown Renderer View */}
                    <div className="flex-1 overflow-y-auto p-8 prose prose-invert max-w-none scrollbar-thin font-tajawal leading-relaxed">
                      {processedMarkdown ? (
                        <div dangerouslySetInnerHTML={{ __html: processedMarkdown }} />
                      ) : (
                        <p className="text-gray-500 italic">لا يوجد محتوى في هذه الملاحظة.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar: Bidirectional Links & AI Note suggestions */}
              <div className="w-72 bg-[#131620]/90 p-5 space-y-6 overflow-y-auto scrollbar-thin shrink-0">
                {/* Backlinks panel */}
                <div>
                  <h4 className="text-sm font-bold text-white font-cairo flex items-center gap-2 mb-3">
                    <LinkIcon className="h-4 w-4 text-indigo-400" />
                    <span>الروابط العكسية ({backlinks.length})</span>
                  </h4>
                  {backlinks.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">لم تذكر أي ملاحظة أخرى هذا الملف.</p>
                  ) : (
                    <div className="space-y-2">
                      {backlinks.map(bl => (
                        <div
                          key={bl.id}
                          onClick={() => handleSelectNote(bl.id)}
                          className="p-2.5 rounded-xl border border-[#2d3252]/50 bg-[#1c2030]/50 hover:bg-[#252a40] cursor-pointer transition-all"
                        >
                          <span className="text-xs font-bold text-white flex items-center gap-1.5 leading-snug">
                            <span>{bl.emoji}</span>
                            <span>{bl.title}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Suggestions connects panel */}
                <div>
                  <h4 className="text-sm font-bold text-white font-cairo flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-orange-400" />
                    <span>اقتراحات الربط بالذكاء الاصطناعي</span>
                  </h4>
                  {suggestions.length === 0 ? (
                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-center">
                      <p className="text-xs text-gray-400 leading-normal">
                        اكتب محتوى مفصلاً واصنع روابط ثنائية جديدة وسيقوم الذكاء الاصطناعي باقتراح روابط خفية لربط الدماغ الثاني.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {suggestions.map((sug, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-1.5"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-indigo-400">اقترح ربط: {sug.title}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] text-indigo-400"
                              onClick={() => {
                                setEditorContent(prev => prev + `\n\n[[${sug.title}]]`)
                                handleStartEdit()
                              }}
                            >
                              ربط الآن
                            </Button>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-normal">{sug.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-[#0f1117]">
              <div className="h-16 w-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 text-indigo-400 glow-primary">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold font-cairo text-white">افتح مستند معرفي أو خريطة الأفكار</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-sm leading-normal">
                اختر ملاحظة من القائمة الجانبية أو اضغط على خريطة الأفكار لاستكشاف الروابط ثنائية الاتجاه.
              </p>
              <Button variant="primary" className="mt-4" onClick={handleCreateNew}>
                أنشئ ملاحظة الآن
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
