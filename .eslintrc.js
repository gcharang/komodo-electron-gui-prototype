module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  globals: {
    __resources: true,
    $nuxt: true,
  },
  parserOptions: {
    sourceType: "module",
    parser: "babel-eslint",
  },
  extends: [
    "@nuxtjs",
    "plugin:vue/recommended",
    //"eslint:recommended",
    "prettier/vue",
    "plugin:prettier/recommended",
  ],
  // add your custom rules here
  rules: {
    // StandardJS — The Rules
    // indent: ["error", 2], // 2 spaces – for indentation
    "max-len": [
      "error",
      { code: 120, ignoreTemplateLiterals: true, ignoreStrings: true },
    ],
    "no-console": "off",
    "arrow-parens": ["error", "always"],
    curly: ["error", "multi-line"],
    "import/no-extraneous-dependencies": "off",
    "require-await": 0,
    "global-require": 0,
    "comma-dangle": [
      2,
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "ignore",
      },
    ],
    "import/no-unresolved": 0,
    "import/newline-after-import": 0,
    "no-underscore-dangle": 0,

    //"no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,

    "vue/max-attributes-per-line": "off",
    "vue/singleline-html-element-content-newline": 0,
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    // "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    //  "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"'indent': ['error', 2],
    "vue/script-indent": ["error", 2, { baseIndent: 0 }],
  },
  overrides: [
    {
      files: ["*.vue"],
      rules: {
        indent: "off",
      },
    },
  ],
};
