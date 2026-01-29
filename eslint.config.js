import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    semi: false,
    commaDangle: 'never'
  },
  formatters: {
    prettier: {
      options: {
        semi: false,
        trailingComma: 'none',
        singleQuote: true
      }
    }
  },
  rules: {
    'style/comma-dangle': ['error', 'never'],
    'style/semi': ['error', 'never'],
    'comma-dangle': 'off',
    'semi': 'off',
    'style/quotes': ['error', 'single', { avoidEscape: true }],
    'style/object-curly-spacing': ['error', 'always'],
    'style/arrow-parens': ['error', 'always'],
    'vue/block-order': 'off',
    'n/prefer-global/process': 'off',
    'no-fallthrough': 'off',
    'vue/no-arrow-functions-in-watch': 'off',
    'vue/arrow-spacing': 'off',
    'vue/prefer-separate-static-class': 'off',
    'antfu/top-level-function': 'off',
    'no-use-before-define': 'off',
    'ts/no-use-before-define': 'off',
    'no-console': 'off'
  },
  languageOptions: {
    globals: {
      h: 'readonly',
      unref: 'readonly',
      provide: 'readonly',
      inject: 'readonly',
      markRaw: 'readonly',
      defineAsyncComponent: 'readonly',
      nextTick: 'readonly',
      useRoute: 'readonly',
      useRouter: 'readonly',
      Message: 'readonly',
      $loadingBar: 'readonly',
      $message: 'readonly',
      $dialog: 'readonly',
      $notification: 'readonly',
      $modal: 'readonly'
    }
  }
})
