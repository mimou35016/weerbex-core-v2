"use client"

import Script from "next/script"

import type { ScriptSnippet } from "@/lib/site-scripts"

/**
 * Injects the analytics, marketing pixel and custom script snippets stored in
 * the SEO settings. Scripts load after hydration so they never block the page.
 */
export function SiteScripts({ snippets }: { snippets: ScriptSnippet[] }) {
  if (snippets.length === 0) return null

  return (
    <>
      {snippets.map((snippet) =>
        snippet.src ? (
          <Script
            key={snippet.id}
            id={snippet.id}
            src={snippet.src}
            strategy="afterInteractive"
            async={snippet.async}
            defer={snippet.defer}
          />
        ) : (
          <Script
            key={snippet.id}
            id={snippet.id}
            type={snippet.type}
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: snippet.content ?? "" }}
          />
        )
      )}
    </>
  )
}
