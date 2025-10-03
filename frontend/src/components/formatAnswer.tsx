// src/utils/formatAnswer.tsx
import React from "react"

export function formatAnswer(text: string) {
  if (!text) return null

  // Tách theo newline
  const lines = text.split("\n").map(line => line.trim())

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        if (!line) return <div key={index} className="h-2" /> // dòng trống = cách dòng

        // Nếu là bullet (- hoặc * hoặc số)
        if (/^[-*]\s+/.test(line)) {
          return (
            <ul key={index} className="list-disc pl-6">
              <li>{line.replace(/^[-*]\s+/, "")}</li>
            </ul>
          )
        }

        if (/^\d+\.\s+/.test(line)) {
          return (
            <ol key={index} className="list-decimal pl-6">
              <li>{line.replace(/^\d+\.\s+/, "")}</li>
            </ol>
          )
        }

        // Xử lý in đậm **text**
        const bolded = line.split(/(\*\*.*?\*\*)/g).map((part, i) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={i}>{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        )

        return (
          <p key={index} className="leading-relaxed">
            {bolded}
          </p>
        )
      })}
    </div>
  )
}
