import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { registerCondition } from "./quartz/plugins/loader/conditions"
import { SiteMetadata } from "./siteMetadata"

registerCondition("index-only", (props) => props.fileData.slug === "index")

const config = await loadQuartzConfig()
config.plugins.transformers.push(SiteMetadata())

export default config
export const layout = await loadQuartzLayout()
