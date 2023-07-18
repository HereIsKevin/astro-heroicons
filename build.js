import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { basename, format, join, resolve } from "node:path"

import camelcase from "camelcase"

const styles = {
  "24/outline": "outline",
  "24/solid": "solid",
  "20/solid": "mini",
}

const script = `---
import type { HTMLAttributes } from "astro/types"

export type Props = HTMLAttributes<"svg">;
---

`

for (const [directory, style] of Object.entries(styles)) {
  const input = resolve("./node_modules/heroicons/", directory)
  const output = resolve("./", style)

  rmSync(output, { recursive: true, force: true })
  mkdirSync(output, { recursive: true })

  const icons = readdirSync(input)

  for (const icon of icons) {
    const path = join(input, icon)
    const content = readFileSync(path, "utf-8")

    const template = content.replace(">", " {...Astro.props}>")
    const component = script + template

    const name = basename(path, ".svg")
    const pascalcased = camelcase(name, { pascalCase: true })
    const file = format({ dir: output, name: pascalcased, ext: "astro" })
    const entry = format({ dir: output, name: pascalcased, ext: "astro.ts" })

    writeFileSync(file, component)
    writeFileSync(
      entry,
      `export { default } from "./${pascalcased}.astro"
`,
    )
  }
}
