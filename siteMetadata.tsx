import { QuartzTransformerPlugin } from "./quartz/plugins/types"

/** Site-owned metadata kept outside Quartz core so upstream files stay updateable. */
export const SiteMetadata: QuartzTransformerPlugin = () => ({
  name: "MockysSiteMetadata",
  externalResources() {
    return {
      additionalHead: [<meta name="baidu-site-verification" content="codeva-aiuaLYUSn0" />],
    }
  },
})
