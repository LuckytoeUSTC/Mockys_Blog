import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { registerCondition } from "./quartz/plugins/loader/conditions"
import { componentRegistry } from "./quartz/components/registry"
import { SiteMetadata } from "./siteMetadata"

registerCondition("index-only", (props) => props.fileData.slug === "index")

componentRegistry.setOptionOverrides("@quartz-community/recent-notes", {
  filter: (file: { filePath?: unknown; relativePath?: string }) =>
    typeof file.filePath === "string" && file.relativePath !== "index.md",
})

const config = await loadQuartzConfig()
config.plugins.transformers.push(SiteMetadata())

export default config
export const layout = await loadQuartzLayout()
