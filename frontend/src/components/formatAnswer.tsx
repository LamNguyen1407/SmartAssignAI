import React from "react"

function parseInline(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  )
}

export function formatAnswer(text: string) {
  if (!text) return null

  const lines = text.split("\n").map(line => line.trim())

  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line) {
      elements.push(<div key={i} className="h-2" />)
      i++
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items = []

      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(
          <li key={i}>
            {parseInline(lines[i].replace(/^[-*]\s+/, ""))}
          </li>
        )
        i++
      }

      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-6 space-y-1">
          {items}
        </ul>
      )
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = []

      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(
          <li key={i}>
            {parseInline(lines[i].replace(/^\d+\.\s+/, ""))}
          </li>
        )
        i++
      }

      elements.push(
        <ol key={`ol-${i}`} className="list-decimal pl-6 space-y-1">
          {items}
        </ol>
      )
      continue
    }

    elements.push(
      <p key={i} className="leading-relaxed">
        {parseInline(line)}
      </p>
    )

    i++
  }

  return <div className="space-y-2">{elements}</div>
}