/**
 * Utilities for turning the raw script snippets stored in the SEO settings
 * into `next/script` friendly descriptors. The snippets may be full
 * `<script>` tags or bare JavaScript, so both shapes are supported.
 */

export type ScriptSnippet = {
  id: string
  src?: string
  content?: string
  type?: string
  async?: boolean
  defer?: boolean
}

const SCRIPT_TAG = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi

function readAttribute(attributes: string, name: string): string | undefined {
  const match = attributes.match(
    new RegExp(
      `${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
      "i"
    )
  )

  if (!match) return undefined

  return match[2] ?? match[3] ?? match[4]
}

function hasAttribute(attributes: string, name: string): boolean {
  return new RegExp(`(^|\\s)${name}(\\s|=|$)`, "i").test(attributes)
}

/**
 * Collects executable snippets from any number of raw settings values.
 * Markup that is not a script (for example plain `<meta>` tags) is ignored,
 * because Next.js manages the document head through the Metadata API.
 */
export function collectScriptSnippets(
  ...sources: Array<string | null | undefined>
): ScriptSnippet[] {
  const snippets: ScriptSnippet[] = []

  for (const source of sources) {
    if (!source || !source.trim()) continue

    SCRIPT_TAG.lastIndex = 0

    let match: RegExpExecArray | null
    let foundTag = false

    while ((match = SCRIPT_TAG.exec(source)) !== null) {
      foundTag = true

      const attributes = match[1] ?? ""
      const src = readAttribute(attributes, "src")?.trim()
      const type = readAttribute(attributes, "type")?.trim()
      const content = (match[2] ?? "").trim()

      if (!src && !content) continue

      snippets.push({
        id: `site-script-${snippets.length}`,
        src: src || undefined,
        content: src ? undefined : content,
        type: type && type !== "text/javascript" ? type : undefined,
        async: hasAttribute(attributes, "async"),
        defer: hasAttribute(attributes, "defer"),
      })
    }

    if (!foundTag) {
      snippets.push({
        id: `site-script-${snippets.length}`,
        content: source.trim(),
      })
    }
  }

  return snippets
}
