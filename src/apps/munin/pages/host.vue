<template>
  <div>
    <template v-for="(plugins_config_per_category, category) in plugins_config">
      <a :id="category" :key="category+'.anchor'"/>
      <q-card :key="category">
        <q-card-section>
          <div class="text-h3">{{category}}</div>
        </q-card-section>

        <q-card-section>
          <template v-for="(config, name) in plugins_config_per_category">
            <munin-plugin-dygraph :ref="name" :id="category+'.'+name" :data="plugins[name]" :config="config" :key="category+'.'+name+'.plugin'"/>
          </template>
        </q-card-section>
        <!-- <q-separator dark /> -->
      </q-card>
    </template>
  </div>

</template>

<script>
import * as Debug from 'debug'
const debug = Debug('apps:munin:pages:host')

//

// let moment = require('moment')

import muninPluginDygraph from '@apps/munin/components/pluginDygraph'

import DataSourcesMixin from '@mixins/dataSources'

import JSPipeline from 'js-pipeline'
import Pipeline from '@apps/munin/pipelines/host'

import { requests, store } from '@apps/munin/sources/host/index'

// const MAX_FEED_DATA = 10

export default {
  mixins: [DataSourcesMixin],

  components: { muninPluginDygraph },

  name: 'MuninHost',

  data () {
    return {
      id: 'munin.host',
      path: 'all',

      // munin: [],
      store: false,
      pipeline_id: 'input.munin.host',

      plugins: {},
      plugins_config: {},
      // plugins_categories: ,

      components: {
        range: {
          // source: {
          //   requests: {
          //     once: [],
          //     periodical: []
          //   }
          // }
          source: {
            requests: requests

            // store: store
          }
        }

      }
    }
  },

  watch: {
    // 'plugins_config': function (val) {
    //   debug('watch plugins_config %o', val.graph)
    // }
  },
  methods: {

    /**
    * @start pipelines
    **/
    create_pipelines: function (next) {
      debug('create_pipelines %o', this.$options.pipelines)

      if (this.$options.pipelines['input.munin.host'] && this.$options.pipelines['input.munin.host'].get_input_by_id('input.munin')) {
        // let requests = this.__components_sources_to_requests(this.components)
        // if (requests.once) {
        //   this.$options.pipelines['input.munin.host'].get_input_by_id('input.munin').conn_pollers[0].options.requests.once.combine(requests.once)
        //   this.$options.pipelines['input.munin.host'].get_input_by_id('input.munin').conn_pollers[0].fireEvent('onOnceRequestsUpdated')
        // }
        //
        // if (requests.periodical) {
        //   this.$options.pipelines['input.munin.host'].get_input_by_id('input.munin').conn_pollers[0].options.requests.periodical.combine(requests.periodical)
        //   this.$options.pipelines['input.munin.host'].get_input_by_id('input.munin').conn_pollers[0].fireEvent('onPeriodicalRequestsUpdated')
        // }
      } else {
        let template = Object.clone(Pipeline)

        let pipeline_id = template.input[0].poll.id
        // let pipeline_id = 'input.munin.host'

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

  },
  computed: {
    'host': function () {
      return (this.$route && this.$route.params && this.$route.params.host) ? this.$route.params.host : undefined
    }
  }
  // computed: {
  //
  // //   count: function () {
  // //     let result = 0
  // //     Array.each(this.groups, function (group) {
  // //       result += group.count
  // //     })
  // //
  // //     return result
  // //   }
  // },
  // mounted: function () {
  //   this.pipeline_id = 'input.munin.host'
  // },
  // create: function () {
  //   debug('created HOST %s %o %o', this.host, this.$options.range_component, this.$options.__pipelines_cfg)
  //   // EventBus.$on(this.pipeline_id, this.__process_input_data)
  //
  //   // if (this.store) this.__register_store_module(this.id, sourceStore)
  //   // this.__bind_components_to_sources(this.components)
  //   // this.create_pipelines()
  //
  //   // this.$options.range_component.source.requests.once[0].params.query.filter.metadata.host = this.host
  //   // this.$options.feed_component.source.requests.periodical[0].params.query.filter.metadata.host = this.host
  //   // this.$set(this.components, 'range', this.$options.range_component)
  //   // this.$set(this.components, 'feed', this.$options.feed_component)
  //   // this.components.range.source.requests.once.push(this.$options.range_component)
  //
  //   this.components.range.source.requests.periodical.push(this.$options.range_component)
  // }

}
</script>
