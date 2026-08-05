import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { SiteMetadata } from "./siteMetadata"

const config = await loadQuartzConfig()
config.plugins.transformers.push(SiteMetadata())

export default config
export const layout = await loadQuartzLayout()
