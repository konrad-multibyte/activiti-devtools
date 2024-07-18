// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['@nuxt/ui-pro'],
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
  css: ['assets/css/main.css'],
  nitro: {
    firebase: {
      gen: 2,
      httpsOptions: {
        maxInstances: 2
      }
    },
    preset: 'firebase'
  }
})
