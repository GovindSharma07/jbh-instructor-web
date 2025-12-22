import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Eraser, Pen, Trash2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export interface WhiteboardRef {
    getStream: () => MediaStream | null;
}

const Whiteboard = forwardRef<WhiteboardRef, {}>((props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // --- STATE ---
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(4);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [zoom, setZoom] = useState(1); // 1.0 to 3.0
    
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    // Expose stream
    useImperativeHandle(ref, () => ({
        getStream: () => {
            if (canvasRef.current) {
                return canvasRef.current.captureStream(30);
            }
            return null;
        }
    }));

    // --- SETUP CANVAS ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Force 720p (16:9) Internal Resolution
        canvas.width = 1280;
        canvas.height = 720;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            
            // Background
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            contextRef.current = ctx;
        }

        // Keep Alive Loop
        const interval = setInterval(() => {
            if (ctx && canvas) {
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(0, 0, 1, 1);
            }
        }, 1000); 

        return () => clearInterval(interval);
    }, []);

    // Update Context on State Change
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = tool === 'eraser' ? '#1a1a1a' : color;
            contextRef.current.lineWidth = tool === 'eraser' ? 20 : brushSize;
        }
    }, [color, brushSize, tool]);

    // --- COORDINATES (Auto-handles Zoom) ---
    const getCoordinates = (event: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        // getBoundingClientRect returns the size AFTER CSS transform/zoom
        const rect = canvas.getBoundingClientRect();
        
        // This scale factor automatically accounts for the Zoom
        const scaleX = canvas.width / rect.width;   
        const scaleY = canvas.height / rect.height; 

        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (event: React.MouseEvent) => {
        const { x, y } = getCoordinates(event);
        contextRef.current?.beginPath();
        contextRef.current?.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (event: React.MouseEvent) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(event);
        contextRef.current?.lineTo(x, y);
        contextRef.current?.stroke();
    };

    const stopDrawing = () => {
        contextRef.current?.closePath();
        setIsDrawing(false);
    };

    const clearBoard = () => {
        if (canvasRef.current && contextRef.current) {
            contextRef.current.fillStyle = '#1a1a1a';
            contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    // --- ZOOM HELPERS ---
    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setZoom(parseFloat(e.target.value));
    };

    const resetZoom = () => setZoom(1);

    return (
        <div className="relative w-full h-full bg-gray-900 flex flex-col overflow-hidden">
            
            {/* SCROLLABLE AREA */}
            <div 
                ref={containerRef}
                className="flex-1 overflow-auto flex items-center justify-center p-4 custom-scrollbar"
                style={{ cursor: tool === 'pen' ? 'crosshair' : 'default' }}
            >
                {/* CANVAS */}
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="shadow-2xl bg-[#1a1a1a] touch-none transition-transform duration-75 ease-out origin-center"
                    style={{
                        // Logic: At 1x, it fits the screen (max-width). 
                        // At >1x, it forces a specific width which causes scrolling.
                        width: zoom === 1 ? 'auto' : `${1280 * 0.8 * zoom}px`, // Heuristic base width
                        maxWidth: zoom === 1 ? '100%' : 'none',
                        aspectRatio: '16/9',
                    }}
                />
            </div>

            {/* TOOLBAR */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800/90 p-2 rounded-xl shadow-xl border border-gray-700 flex flex-col gap-3 z-10 backdrop-blur-sm">
                
                {/* Row 1: Tools */}
                <div className="flex items-center gap-4 justify-center">
                    <button 
                        onClick={() => setTool('pen')}
                        className={`p-2 rounded-full transition-colors ${tool === 'pen' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        title="Pen"
                    >
                        <Pen size={18} />
                    </button>

                    {tool === 'pen' && (
                        <div className="flex gap-2 mx-2">
                            {['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#eab308'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-5 h-5 rounded-full border-2 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    )}

                    <button 
                        onClick={() => setTool('eraser')}
                        className={`p-2 rounded-full transition-colors ${tool === 'eraser' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        title="Eraser"
                    >
                        <Eraser size={18} />
                    </button>

                    <div className="w-px h-6 bg-gray-600 mx-1"></div>

                    <button 
                        onClick={clearBoard}
                        className="p-2 rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                        title="Clear Board"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Row 2: Zoom Controls */}
                <div className="flex items-center justify-between px-2 gap-3 border-t border-gray-700 pt-2">
                    <button onClick={resetZoom} className="text-gray-400 hover:text-white" title="Reset Zoom">
                        <Maximize size={14} />
                    </button>
                    
                    <ZoomOut size={14} className="text-gray-400" />
                    
                    <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.1" 
                        value={zoom}
                        onChange={handleZoomChange}
                        className="w-32 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    
                    <ZoomIn size={14} className="text-gray-400" />
                    
                    <span className="text-xs text-gray-300 w-8 text-right">{Math.round(zoom * 100)}%</span>
                </div>

            </div>
        </div>
    );
});

export default Whiteboard;