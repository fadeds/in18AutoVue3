# inVue3

This template should help get you started developing with Vue 3 in Vite. 用来处理自动化国际化的项目

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Features

- 自动化国际化处理
- 基于 Vue 3 和 Vite 的快速开发
- 集成 Playwright 进行端到端测试
- 使用 ESLint 进行代码质量检查

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Usage

1. 配置国际化文件：
   - 在 `src/locales` 文件夹中添加语言文件，例如 `en.json` 和 `zh.json`。
2. 使用国际化工具：
   - 在组件中通过 `$t('key')` 方法获取对应语言的翻译。
3. 构建项目：
   - 使用 `npm run build` 生成生产环境代码。
