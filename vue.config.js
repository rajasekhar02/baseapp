const path = require("path");
module.exports = {
  chainWebpack: config => {
    configModules(config);
    configOutput(config);
    configOptimization(config);
    const types = ["vue-modules", "vue", "normal-modules", "normal"];
    types.forEach(type =>
      addStyleResource(config.module.rule("scss").oneOf(type))
    );
    config.module
      .rule("elDatePicker")
      .test(/\.js$/)
      .include.add(path.resolve("src"))
      .add(path.resolve("node_modules/element-ui/packages/date-picker"))
      .add(path.resolve("node_modules/element-ui/packages/scrollbar"))
      .end()
      .use("babel-loader")
      .loader("babel-loader")
      .end();
  },
  filenameHashing: true,
  css: { extract: true },
  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: false
    },
    webpackBundleAnalyzer: {
      openAnalyzer: true
    }
  }
};

function configModules(config) {
  config.module
    .rule("vue")
    .use("vue-loader")
    .tap(options => {
      options.compilerOptions.whitespace = "preserve";
      return options;
    });
  config.module
    .rule("worker")
    .test(/\.worker\.js$/)
    .use("worker-loader")
    .loader("worker-loader")
    .end();
}
function configOutput(config) {
  config.output.filename("[name].[hash:8].js");
}
function configOptimization(config) {
  config.optimization.usedExports(true);
  config.optimization.minimizer("terser").tap(args => {
    args[0].terserOptions.compress.drop_console = true;
    return args;
  });
}

function addStyleResource(rule) {
  rule
    .use("style-resource")
    .loader("style-resources-loader")
    .options({
      patterns: [
        path.resolve(__dirname, "./src/styles/_base.scss"),
        path.resolve(__dirname, "./src/styles/mixins.scss")
      ]
    });
}
