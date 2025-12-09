"use client"

import { useEffect, useRef, useState } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal as TerminalIcon, Play, RotateCcw } from "lucide-react"

interface TerminalComponentProps {
  projectId: string
}

export default function TerminalComponent({ projectId }: TerminalComponentProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstanceRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentCommand, setCurrentCommand] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  useEffect(() => {
    if (!terminalRef.current) return

    // Initialize terminal
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      theme: {
        background: '#1a1a1a',
        foreground: '#ffffff',
        cursor: '#ffffff',
        selection: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      },
      cols: 80,
      rows: 24,
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    
    terminal.open(terminalRef.current)
    fitAddon.fit()
    
    terminalInstanceRef.current = terminal
    fitAddonRef.current = fitAddon

    // Welcome message
    terminal.writeln('\x1b[32mWelcome to AiAppsy Terminal\x1b[0m')
    terminal.writeln('\x1b[36mProject: ' + projectId + '\x1b[0m')
    terminal.writeln('Type \x1b[33mhelp\x1b[0m for available commands')
    terminal.writeln('')

    // Handle terminal data
    terminal.onData((data) => {
      // For demo purposes, we'll simulate command handling
      if (data === '\r') {
        const command = currentCommand.trim()
        if (command) {
          setCommandHistory(prev => [...prev, command])
          setHistoryIndex(-1)
          handleCommand(command, terminal)
          setCurrentCommand("")
        }
      } else if (data === '\u007f') {
        // Backspace
        if (currentCommand.length > 0) {
          setCurrentCommand(prev => prev.slice(0, -1))
          terminal.write('\b \b')
        }
      } else if (data === '\u001b[A') {
        // Up arrow
        if (commandHistory.length > 0) {
          const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
          setHistoryIndex(newIndex)
          const command = commandHistory[commandHistory.length - 1 - newIndex]
          setCurrentCommand(command)
          
          // Clear current line and write new command
          terminal.write('\r\x1b[K$ ' + command)
        }
      } else if (data === '\u001b[B') {
        // Down arrow
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          setHistoryIndex(newIndex)
          const command = commandHistory[commandHistory.length - 1 - newIndex]
          setCurrentCommand(command)
          terminal.write('\r\x1b[K$ ' + command)
        } else if (historyIndex === 0) {
          setHistoryIndex(-1)
          setCurrentCommand("")
          terminal.write('\r\x1b[K$ ')
        }
      } else if (data >= ' ' && data <= '~') {
        setCurrentCommand(prev => prev + data)
        terminal.write(data)
      }
    })

    terminal.focus()
    setIsConnected(true)

    // Handle resize
    const handleResize = () => {
      if (fitAddon) {
        fitAddon.fit()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      terminal.dispose()
      window.removeEventListener('resize', handleResize)
      setIsConnected(false)
    }
  }, [projectId])

  const handleCommand = (command: string, terminal: Terminal) => {
    terminal.writeln('')

    switch (command.toLowerCase()) {
      case 'help':
        terminal.writeln('\x1b[33mAvailable commands:\x1b[0m')
        terminal.writeln('  \x1b[32mhelp\x1b[0m     - Show this help message')
        terminal.writeln('  \x1b[32mclear\x1b[0m    - Clear the terminal')
        terminal.writeln('  \x1b[32mls\x1b[0m       - List files')
        terminal.writeln('  \x1b[32mpwd\x1b[0m      - Show current directory')
        terminal.writeln('  \x1b[32mdate\x1b[0m     - Show current date and time')
        terminal.writeln('  \x1b[32mwhoami\x1b[0m   - Show current user')
        terminal.writeln('  \x1b[32mnode -v\x1b[0m  - Show Node.js version')
        terminal.writeln('  \x1b[32mnpm -v\x1b[0m   - Show npm version')
        terminal.writeln('  \x1b[32mecho\x1b[0m     - Echo text')
        break
        
      case 'clear':
        terminal.clear()
        break
        
      case 'ls':
        terminal.writeln('\x1b[34mpackage.json\x1b[0m')
        terminal.writeln('\x1b[34msrc/\x1b[0m')
        terminal.writeln('\x1b[34mpublic/\x1b[0m')
        terminal.writeln('\x1b[34mREADME.md\x1b[0m')
        break
        
      case 'pwd':
        terminal.writeln('/home/project/' + projectId)
        break
        
      case 'date':
        terminal.writeln(new Date().toString())
        break
        
      case 'whoami':
        terminal.writeln('developer')
        break
        
      case 'node -v':
        terminal.writeln('v18.17.0')
        break
        
      case 'npm -v':
        terminal.writeln('9.6.7')
        break
        
      default:
        if (command.startsWith('echo ')) {
          const text = command.slice(5)
          terminal.writeln(text)
        } else if (command.startsWith('npm ')) {
          terminal.writeln('\x1b[33mSimulating npm command...\x1b[0m')
          setTimeout(() => {
            terminal.writeln('\x1b[32m✓ Command completed\x1b[0m')
            terminal.write('$ ')
          }, 1000)
          return
        } else if (command.startsWith('node ')) {
          terminal.writeln('\x1b[33mRunning Node.js script...\x1b[0m')
          setTimeout(() => {
            terminal.writeln('\x1b[32m✓ Script executed\x1b[0m')
            terminal.write('$ ')
          }, 1000)
          return
        } else {
          terminal.writeln('\x1b[31mCommand not found: ' + command + '\x1b[0m')
          terminal.writeln('Type \x1b[33mhelp\x1b[0m for available commands')
        }
    }
    
    terminal.write('$ ')
  }

  const clearTerminal = () => {
    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.clear()
      terminalInstanceRef.current.writeln('\x1b[32mTerminal cleared\x1b[0m')
      terminalInstanceRef.current.write('$ ')
    }
  }

  const focusTerminal = () => {
    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.focus()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-4 w-4" />
            <span className="font-medium">Terminal</span>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={clearTerminal}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
          
          <Button size="sm" variant="ghost" onClick={focusTerminal}>
            <Play className="h-4 w-4 mr-2" />
            Focus
          </Button>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 bg-black p-2">
        <div 
          ref={terminalRef} 
          className="h-full w-full"
          onClick={focusTerminal}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t text-xs text-muted-foreground bg-muted/30">
        <div className="flex items-center gap-4">
          <span>Shell: bash</span>
          <span>Project: {projectId}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>LF</span>
        </div>
      </div>
    </div>
  )
}