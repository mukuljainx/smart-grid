module.exports = [{
      plugin: require('../node_modules/gatsby-plugin-mdx/gatsby-browser.js'),
      options: {"plugins":[{"resolve":"/Users/i0424/react/smart-grid/node_modules/gatsby-remark-autolink-headers","id":"c2a85404-f97d-5ac0-848d-e491d7dfdbe3","name":"gatsby-remark-autolink-headers","version":"3.2.0","pluginOptions":{"plugins":[],"offsetY":0,"className":"anchor"},"nodeAPIs":["pluginOptionsSchema"],"browserAPIs":["onInitialClientRender","shouldUpdateScroll"],"ssrAPIs":["onRenderBody"]},{"resolve":"/Users/i0424/react/smart-grid/node_modules/gatsby-remark-images","id":"28c42f28-53d0-5cae-aad5-aee248175898","name":"gatsby-remark-images","version":"4.2.0","pluginOptions":{"plugins":[],"maxWidth":650,"linkImagesToOriginal":true,"showCaptions":false,"markdownCaptions":false,"sizeByPixelDensity":false,"backgroundColor":"white","quality":50,"withWebp":false,"tracedSVG":false,"loading":"lazy","disableBgImageOnAlpha":false,"disableBgImage":false},"nodeAPIs":["pluginOptionsSchema"],"browserAPIs":["onRouteUpdate"],"ssrAPIs":[]}],"extensions":[".mdx",".md"],"gatsbyRemarkPlugins":["gatsby-remark-autolink-headers","gatsby-remark-embedder",{"resolve":"gatsby-remark-images","options":{"maxWidth":960,"withWebp":true,"linkImagesToOriginal":false}},"gatsby-remark-responsive-iframe","gatsby-remark-copy-linked-files"],"defaultLayouts":{},"lessBabel":false,"remarkPlugins":[],"rehypePlugins":[],"mediaTypes":["text/markdown","text/x-markdown"],"root":"/Users/i0424/react/smart-grid"},
    },{
      plugin: require('../node_modules/gatsby-remark-autolink-headers/gatsby-browser.js'),
      options: {"plugins":[],"offsetY":0,"className":"anchor"},
    },{
      plugin: require('../node_modules/gatsby-remark-images/gatsby-browser.js'),
      options: {"plugins":[],"maxWidth":650,"linkImagesToOriginal":true,"showCaptions":false,"markdownCaptions":false,"sizeByPixelDensity":false,"backgroundColor":"white","quality":50,"withWebp":false,"tracedSVG":false,"loading":"lazy","disableBgImageOnAlpha":false,"disableBgImage":false},
    },{
      plugin: require('../node_modules/gatsby-plugin-catch-links/gatsby-browser.js'),
      options: {"plugins":[]},
    },{
      plugin: require('../node_modules/@rocketseat/gatsby-theme-docs/gatsby-browser.js'),
      options: {"plugins":[],"configPath":"src/config","docsPath":"src/docs","repositoryUrl":"https://github.com/mukuljainx/smart-grid/tree/2.x.x","baseDir":"examples/gatsby-theme-docs"},
    },{
      plugin: require('../node_modules/gatsby-plugin-manifest/gatsby-browser.js'),
      options: {"plugins":[],"name":"Rocketseat Gatsby Themes","short_name":"RS Gatsby Themes","start_url":"/","background_color":"#ffffff","display":"standalone","icon":"static/favicon.png","legacy":true,"theme_color_in_head":true,"cache_busting_mode":"query","crossOrigin":"anonymous","include_favicon":true,"cacheDigest":"3080d18ca83c744b593bbe610dea4077"},
    },{
      plugin: require('../node_modules/gatsby-plugin-canonical-urls/gatsby-browser.js'),
      options: {"plugins":[],"siteUrl":"https://rocketdocs.netlify.app"},
    },{
      plugin: require('../node_modules/gatsby-plugin-offline/gatsby-browser.js'),
      options: {"plugins":[]},
    }]
