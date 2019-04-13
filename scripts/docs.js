const path = require('path')
const fs = require('fs-extra')
const { command } = require('doc-scripts')

const createDocs = async () => {
  const packagesDir = path.resolve(process.cwd(), './packages')
  const packages = await fs.readdir(packagesDir)
  const alias = packages
    .map(v => path.join(packagesDir, v))
    .filter(v => {
      return !fs.statSync(v).isFile()
    })
    .reduce((buf, _path) => {
      const name = path.basename(_path)
      return {
        ...buf,
        [`@uform/${name}`]: `${_path}/src`
      }
    }, {})
  command(
    {
      title: 'UForm',
      renderer: path.resolve(__dirname, './doc-renderer.js')
    },
    (webpackConfig, mode) => {
      webpackConfig.output.filename = 'bundle.[name].js'
      if (mode === 'production') {
        webpackConfig.output.publicPath = '//unpkg.com/@uform/docs@latest/'
      }
      webpackConfig.plugins.forEach(plugin => {
        if (plugin.constructor.name === 'HtmlWebpackPlugin') {
          plugin.options.filename = path.resolve(
            __dirname,
            `../docs/${plugin.options.filename}`
          )
        }
      })
      Object.assign(webpackConfig.resolve.alias, {
        ...alias,
        '@alifd/next': path.resolve(
          __dirname,
          '../packages/next/node_modules/@alifd/next'
        )
      })
      return webpackConfig
    }
  )
}
createDocs()
