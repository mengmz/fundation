import _ from 'lodash'
import Vue from 'vue'
import App from '../../../App.vue'
import store from '../../../store'
import router from '../../../router'
import meta from 'vue-meta'
import { sync } from 'vuex-router-sync'
import * as filters from '../../../filters'
import * as plugins from '../../../plugins'
import axios from 'axios'
import config from '../../../config/config'
import cookie from 'vue-cookie'

// https://medium.com/the-vue-point/retiring-vue-resource-871a82880af4#.w5c4snp5p
// access this.$http like in vue-resource
Vue.prototype.$http = axios

// sync the router with the vuex store.
// this registers `store.state.route`
sync(store, router)

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// create the app instance.
// here we inject the router and store to all child components,
// making them available everywhere as `this.$router` and `this.$store`.
const app = new Vue(Vue.util.extend({
  router,
  store
}, App))

// load plugins
Object.keys(plugins).forEach(key => {
  let pluginConfig = _.get(config, 'plugins.' + key, {})
  Vue.use(plugins[key], pluginConfig)
})

// expose the app, the router and the store.
// note we are not mounting the app here, since bootstrapping will be
// different depending on whether we are in a browser or on the server.
export { app, router, store }
