// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    es6: true,
    node: true,
    commonjs: true
  },
  // extends: ['alloy'],
  plugins: ['prettier', '@typescript-eslint'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    __DEV__: true,
    __WECHAT__: true,
    __ALIPAY__: true,
    App: true,
    Page: true,
    Component: true,
    Behavior: true,
    wx: true,
    my: true,
    swan: true,
    getApp: true,
    getCurrentPages: true
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'arrow-spacing': ["error", { "before": true, "after": true }], // 箭头函数使用一致空格 a => b
    "comma-dangle": ["error", "never"], // 禁用拖尾逗号 ['a': 1, 'b': 3],3后面不能有逗号
    'comma-spacing': ["error", { "before": false, "after": true }], // 强制在逗号周围使用空格 a = 1, b = 3; 前面不要有空格，后面有空格
    "computed-property-spacing": ["error", "never"], // 禁止在计算属性中使用空格 a['key']
    curly: "error", // 要求遵循大括号约定 if () {} 必须要有{}
    eqeqeq: "warn", // 要求使用 === 和 !==
    indent: ["error", 2, { SwitchCase: 1 }],
    "keyword-spacing": "off",
    'newline-after-var': ["error", "always"], // 要求变量声明语句后有一行空行
    "no-console": "off", // 允许使用console
    "no-empty": "warn", // 禁止空块语句
    "no-extra-semi": "warn", // 警告不必要的分号
    "no-extra-boolean-cast": "off", // 警告不必要的布尔类型转换 -> 改成关闭
    "no-redeclare": "warn", // 警告重新声明变量
    // "no-spaced-func": "error", // 函数调用时函数名与()之间不能有空格
    "no-undef": "warn", // 警告没定义
    "no-unused-vars": "off", // 关闭未使用过的变量
    'object-curly-spacing': ["error", "always"], // 强制在花括号中使用一致的空格 {'a': 1, 'b': 2}
    'space-before-blocks': ["error", "always"], // 要求语句块之前的空格
    // 'space-before-function-paren': ["error", "always"], // 要求函数圆括号之前有一个空格
    'space-in-parens': ["error", "never"], // 强制圆括号内没有空格
    "space-unary-ops": "error", // 要求在一元操作符之前或之后存在空格
    'array-callback-return': 1,
    'no-debugger': 2,
    'no-var': 0,
    'no-param-reassign': 0,
    'no-irregular-whitespace': 0,
    'no-useless-catch': 1,
    'default-case': 0,                //要求 switch 语句中有 default 分支
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
      '@typescript-eslint/rule-name': 'error',
    },
  }
 
}