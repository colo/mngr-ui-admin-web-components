<template>
  <q-page>
    <div class="q-pa-md">
      <div class="bg-primary text-white">
        <q-toolbar >
          <q-breadcrumbs active-color="white" style="font-size: 16px">
            <q-breadcrumbs-el label="Home" icon="home" to="/"/>
            <q-breadcrumbs-el disabled label="Logs"/>
          </q-breadcrumbs>
        </q-toolbar>
        <q-toolbar>
          <!-- <q-btn flat round dense icon="assignment_ind"/> -->
          <!-- <q-toolbar-title>Quasar</q-toolbar-title> -->

          <q-btn flat class="q-mr-xs" label="Web" :to="{name : 'logs_web'}"/>
          <q-btn flat class="q-mr-xs" label="Educativa" :to="{name : 'logs_educativa'}"/>
          <!-- <q-btn flat round dense icon="gamepad"/> -->
        </q-toolbar>
      </div>

      <q-table
        class="my-sticky-header-table"
        title="Logs"
        :data="logs"
        :columns="columns"
        :row-key="row => row.domain +'.'+ row.host +'.'+ row.path"
        :pagination.sync="pagination"
        virtual-scroll
        :rows-per-page-options="[0]"
        :visible-columns="($q.screen.lt.sm) ? visibleColumns : allColumns"
        :loading="loading"
        :filter="search_filter"
      >
      <!--
      color="amber"
      dark
    -->
        <template v-slot:top="props">
          <q-select
            v-if="$q.screen.lt.sm"
            v-model="visibleColumns"
            multiple
            borderless
            dense
            options-dense
            :display-value="$q.lang.table.columns"
            emit-value
            map-options
            :options="columns"
            option-value="name"
            style="min-width: 150px"
          />
          <q-space />
          <!-- <div v-if="$q.screen.gt.xs" class="col">
            <q-toggle v-model="visibleColumns" val="schema" label="Schema" />
            <q-toggle v-model="visibleColumns" val="uri" label="URI" />
            <q-toggle v-model="visibleColumns" val="port" label="Port" />
            <q-toggle v-model="visibleColumns" val="host" label="Host" />
            <q-toggle v-model="visibleColumns" val="timestamp" label="Last Update" />
            <q-toggle v-model="visibleColumns" val="path" label="Type" />
          </div> -->

          <q-input borderless dense debounce="100" v-model="search_filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn
          flat round dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
        </template>

        <template v-slot:body="props">
        <q-tr :props="props">

          <q-td key="View" :props="props">
            <!-- View -->
            <!-- <q-btn type="a" :href="props.row.schema+'://'+props.row.uri+':'+props.row.port" target="_blank" flat icon="open_in_new" /> -->
            <q-btn
              v-on:click="destroy_pipelines()"
              :to="'/logs/'+((props.row.path === 'logs.apache2' || props.row.path === 'logs.nginx') ? 'web' : props.row.path.replace('logs.', '')) +'/filter/?domain=' + props.row.domain+'&host=' + props.row.host+'&path=' + props.row.path"
              flat
              icon="open_in_browser"
              />
          </q-td>

          <q-td key="domain" :props="props">
            <!-- <q-btn type="a" :href="props.row.schema+'://'+props.row.uri+':'+props.row.port" target="_blank" flat icon="open_in_new" /> -->
            <q-btn
              v-on:click="destroy_pipelines()"
              :to="'/logs/'+((props.row.path === 'logs.apache2' || props.row.path === 'logs.nginx') ? 'web' : props.row.path.replace('logs.', '')) +'/filter/?domain=' + props.row.domain" flat icon="open_in_browser" :label="props.row.domain"
            />
          </q-td>

          <!-- <q-td key="host" :props="props">
            <q-btn :to="'/logs/'+((props.row.path === 'logs.apache2' || props.row.path === 'logs.nginx') ? 'web' : props.row.path.replace('logs.', '')) +'/filter/?host=' + props.row.host" flat icon="open_in_browser" :label="props.row.host"/>
          </q-td> -->
          <q-td key="host" :props="props">
            <q-btn
              v-on:click="destroy_pipelines()"
              :to="'/logs/filter/?host=' + props.row.host"
              flat
              icon="open_in_browser"
              :label="props.row.host"
            />
          </q-td>

          <!-- <q-td key="timestamp" :props="props">
            {{ format_time(props.row.timestamp) }}
          </q-td> -->
          <q-td key="path" :props="props">
            <q-btn
            v-on:click="destroy_pipelines()"
            :to="'/logs/'+((props.row.path === 'logs.apache2' || props.row.path === 'logs.nginx') ? 'web' : props.row.path.replace('logs.', '')) +'/filter/?path=' + props.row.path"
            flat
            icon="open_in_browser"
            :label="props.row.path"
            />
          </q-td>
        </q-tr>
        </template>
      </q-table>
    </div>

    <!-- <vk-card class="uk-background-secondary"> -->

      <!-- v-if="!web" -->

    <!-- </vk-card> -->

    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]" :duration="50">
      <q-btn fab icon="keyboard_arrow_up" color="accent" />
    </q-page-scroller>

  </q-page>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

import * as Debug from 'debug'
const debug = Debug('apps:logs:pages:all')

import JSPipeline from 'js-pipeline'
import Pipeline from '@apps/logs/pipelines//all'

import DataSourcesMixin from '@mixins/dataSources'

// import LogsWebCard from '@apps/logs/components/webCard.vue'

import { requests, store } from '@apps/logs/sources/all/index'

export default {
  mixins: [DataSourcesMixin],
  // components: { LogsWebCard },
  // extends: DataSourcesMixin,

  name: 'LogsWebsAll',

  // pipelines: {},
  // __pipelines_cfg: {},
  // unwatch_store: undefined,

  data () {
    return {
      height: '0px',

      logs: [],

      search_filter: '',
      loading: true,
      allColumns: ['View', 'domain', 'host', 'path'],
      visibleColumns: ['domain'],
      pagination: {
        rowsPerPage: 50
      },

      columns: [
        { name: 'View', label: 'View', field: 'View', sortable: true, align: 'left' },
        {
          name: 'domain',
          required: true,
          label: 'Domain',
          align: 'left',
          field: 'domain',
          sortable: true
        },
        { name: 'host', align: 'left', label: 'Host', field: 'host', sortable: true },
        // {
        //   name: 'timestamp',
        //   align: 'left',
        //   label: 'Last Update',
        //   field: 'timestamp',
        //   sortable: true
        // },
        { name: 'path', align: 'left', label: 'Type', field: 'path', sortable: true }
      ],

      // web: undefined,
      // logs_paths: {},
      // paths: [],
      /**
      * dataSources
      **/
      store: false,
      pipeline_id: 'input.logs.all',

      id: 'logs.all',
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
  // computed: {
  //   'web': function () {
  //     return (this.$route && this.$route.params && this.$route.params.web) ? this.$route.params.web : undefined
  //   }
  // },
  // computed: {
  //   'web': function () {
  //     // return (this.$route && this.$route.params && this.$route.params.web) ? this.$route.params.web : undefined
  //     return (this.$route && this.$route.query)
  //       ? (this.$route.query.domain) ? this.$route.query.domain : (this.$route.query.host) ? this.$route.query.host : this.$route.query.path
  //       : undefined
  //   }
  // },
  methods: {
    /**
    * @start pipelines
    **/
    create_pipelines: function (next) {
      debug('create_pipelines %o', this.$options.pipelines)

      if (this.$options.pipelines['input.logs.all'] && this.$options.pipelines['input.logs.all'].get_input_by_id('input.logs.all')) {
        // let requests = this.__components_sources_to_requests(this.components)
        // if (requests.once) {
        //   this.$options.pipelines['input.logs.all'].get_input_by_id('input.logs.all').conn_pollers[0].options.requests.once.combine(requests.once)
        //   this.$options.pipelines['input.logs.all'].get_input_by_id('input.logs.all').conn_pollers[0].fireEvent('onOnceRequestsUpdated')
        // }
        //
        // if (requests.periodical) {
        //   this.$options.pipelines['input.logs.all'].get_input_by_id('input.logs.all').conn_pollers[0].options.requests.periodical.combine(requests.periodical)
        //   this.$options.pipelines['input.logs.all'].get_input_by_id('input.logs.all').conn_pollers[0].fireEvent('onPeriodicalRequestsUpdated')
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

<style lang="sass">
.my-sticky-header-table
  /* max height is important */
  .q-table__middle
    max-height: 600px
    // min-height: 600px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    // // background-color: #1d1d1d

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
