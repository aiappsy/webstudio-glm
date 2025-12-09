"use client"

import { useEffect, useRef } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"

interface XtermTerminalProps {
  projectId: string
}

export default function XtermTerminal({ projectId }: XtermTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstanceRef = useRef<Terminal | null>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      theme: {
        background: '#0d1117',
        foreground: '#e6edf3',
        cursor: '#58a6ff',
        selection: '#264f78',
        black: '#484f58',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc',
      },
      cols: 80,
      rows: 24,
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    
    terminal.open(terminalRef.current)
    fitAddon.fit()
    
    terminalInstanceRef.current = terminal

    // Welcome message
    terminal.writeln('\x1b[36mWelcome to AiAppsy Terminal!\x1b[0m')
    terminal.writeln('\x1b[32mProject: ' + projectId + '\x1b[0m')
    terminal.writeln('')
    terminal.write('$ ')

    // Handle terminal input
    let currentLine = ''
    terminal.onData((data) => {
      if (data === '\r') {
        // Enter key
        terminal.writeln('')
        
        // Simple command handling
        if (currentLine.trim() === 'clear') {
          terminal.clear()
        } else if (currentLine.trim() === 'help') {
          terminal.writeln('Available commands:')
          terminal.writeln('  clear    - Clear the terminal')
          terminal.writeln('  help     - Show this help message')
          terminal.writeln('  ls       - List files (simulated)')
          terminal.writeln('  pwd      - Show current directory')
          terminal.writeln('  date     - Show current date and time')
        } else if (currentLine.trim() === 'ls') {
          terminal.writeln('src/')
          terminal.writeln('public/')
          terminal.writeln('package.json')
          terminal.writeln('README.md')
        } else if (currentLine.trim() === 'pwd') {
          terminal.writeln('/workspace/' + projectId)
        } else if (currentLine.trim() === 'date') {
          terminal.writeln(new Date().toString())
        } else if (currentLine.trim() !== '') {
          terminal.writeln('\x1b[31mCommand not found: ' + currentLine.trim() + '\x1b[0m')
          terminal.writeln('Type "help" for available commands')
        }
        
        currentLine = ''
        terminal.write('$ ')
      } else if (data === '\u007F') {
        // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1)
          terminal.write('\b \b')
        }
      } else if (data >= ' ' && data <= '~') {
        // Printable characters
        currentLine += data
        terminal.write(data)
      }
    })

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      terminal.dispose()
      window.removeEventListener('resize', handleResize)
    }
  }, [projectId])

  return <div ref={terminalRef} className="h-full w-full" />
}