<template>
  <q-page>
    <div class="q-pa-md">
      <div class="bg-primary text-white">
        <q-toolbar >
          <q-breadcrumbs active-color="white" style="font-size: 16px">
            <q-breadcrumbs-el label="Home" icon="home" to="/"/>
            <q-breadcrumbs-el label="Munin" :to="{name : 'munin'}"/>
            <q-breadcrumbs-el label="Hosts" v-bind="(!host) ? {'disabled' : true} : ''" :to="{name : 'munin_hosts'}"/>
            <q-breadcrumbs-el :label="host" v-if="host" />
          </q-breadcrumbs>
        </q-toolbar>
        <q-toolbar>
          <!-- <q-btn flat round dense icon="assignment_ind"/> -->
          <!-- <q-toolbar-title>Quasar</q-toolbar-title> -->

          <q-btn flat class="q-mr-xs" label="Hosts" :to="{name : 'munin_hosts'}"/>
          <q-btn flat class="q-mr-xs" label="Categories" :to="{name : 'munin_categories'}"/>
          <!-- <q-btn flat round dense icon="gamepad"/> -->
        </q-toolbar>
      </div>

      <template v-for="(host_categories, host_name) in hosts_categories">
        <munin-host-card
          :key="host_name"
          v-if="!host || host_name === host"
          :categories="host_categories"
          :host="host_name"
        />
      </template>

      <router-view :key="$route.path +'.'+ JSON.stringify($route.query)"></router-view>

      <template v-for="(host_categories, host_name) in hosts_categories">
        <munin-host-card
          :key="host_name+'.bottom'"
          v-if="host_name === host"
          :categories="host_categories"
          :host="host_name"
        />
      </template>
    </div>

    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]" :duration="50">
      <q-btn fab icon="keyboard_arrow_up" color="primary" />
    </q-page-scroller>
    <!-- v-if="!host || host_name === host" -->

     <!-- :key="$route.fullPath" -->
    <!-- <vk-card class="uk-background-secondary uk-light" v-for="(categories, host) in hosts_categories" :key="host">

      <vk-card-title>
        <router-link :to="'/munin/hosts/'+host" v-slot="{ href, route, navigate, isActive, isExactActive }"
        >
          <h3 class="uk-light"><a class="uk-link-heading" :href="href" @click="navigate">{{host}}</a></h3>
        </router-link>

      </vk-card-title>

      <ul class="uk-subnav uk-subnav-divider" uk-margin>
        <li v-for="category in categories" :key="host+'.'+category">
          <router-link :to="'/munin/hosts/'+host+'#'+category" v-slot="{ href, route, navigate, isActive, isExactActive }"
          >
            <a :href="href" @click="navigate">{{category}}</a>
          </router-link>
        </li>
      </ul>
    </vk-card> -->
  </q-page>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

import * as Debug from 'debug'
const debug = Debug('apps:munin')

import JSPipeline from 'js-pipeline'
import Pipeline from '@apps/munin/pipelines/hosts'

import DataSourcesMixin from '@mixins/dataSources'

import MuninHostCard from '@apps/munin/components/hostCard.vue'

import { requests, store } from '@apps/munin/sources/hosts/index'

export default {
  mixins: [DataSourcesMixin],
  components: { MuninHostCard },
  // extends: DataSourcesMixin,

  name: 'Munin',

  // pipelines: {},
  // __pipelines_cfg: {},
  // unwatch_store: undefined,

  data () {
    return {
      height: '0px',

      // host: undefined,
      hosts_categories: {},
      categories: [],
      /**
      * dataSources
      **/
      store: false,
      pipeline_id: 'input.munin.hosts',

      id: 'munin.hosts',
      path: 'all',

      components: {
        'all': [
          {
            source: {
              requests: requests

              // store: store
            }
          }

        ]
      }
    }
  },
  computed: {
    'host': function () {
      return (this.$route && this.$route.params && this.$route.params.host) ? this.$route.params.host : undefined
    }
  },
  methods: {
    /**
    * @start pipelines
    **/
    create_pipelines: function (next) {
      debug('create_pipelines %o', this.$options.pipelines)

      if (this.$options.pipelines['input.munin.hosts'] && this.$options.pipelines['input.munin.hosts'].get_input_by_id('input.munin.hosts')) {
        // let requests = this.__components_sources_to_requests(this.components)
        // if (requests.once) {
        //   this.$options.pipelines['input.munin.hosts'].get_input_by_id('input.munin.hosts').conn_pollers[0].options.requests.once.combine(requests.once)
        //   this.$options.pipelines['input.munin.hosts'].get_input_by_id('input.munin.hosts').conn_pollers[0].fireEvent('onOnceRequestsUpdated')
        // }
        //
        // if (requests.periodical) {
        //   this.$options.pipelines['input.munin.hosts'].get_input_by_id('input.munin.hosts').conn_pollers[0].options.requests.periodical.combine(requests.periodical)
        //   this.$options.pipelines['input.munin.hosts'].get_input_by_id('input.munin.hosts').conn_pollers[0].fireEvent('onPeriodicalRequestsUpdated')
        // }
      } else {
        let template = Object.clone(Pipeline)

        let pipeline_id = template.input[0].poll.id

        // template.input[0].poll.conn[0].requests = this.__components_sources_to_requests(this.components)
        Array.each(template.input[0].poll.conn, function (conn, index) {
          template.input[0].poll.conn[index].requests = this.__components_sources_to_requests(this.components)
        }.bind(this))

        let pipe = new JSPipeline(template)

        this.$options.__pipelines_cfg[pipeline_id] = {
          ids: [],
          connected: [],
          suspended: pipe.inputs.every(function (input) { return input.options.suspended }, this)
        }

        // this.__after_connect_inputs(
        //   pipe,
        //   this.$options.__pipelines_cfg[pipeline_id],
        //   this.__resume_pipeline.pass([pipe, this.$options.__pipelines_cfg[pipeline_id], this.id, function () {
        //     debug('__resume_pipeline CALLBACK')
        //     pipe.fireEvent('onOnce')
        //   }], this)
        // )

        this.$options.pipelines[pipeline_id] = pipe

        debug('create_pipelines %o', this.$options.pipelines)

        if (next) { next() }
      }
    }

    /**
    * @end pipelines
    **/

  }
}
</script>
