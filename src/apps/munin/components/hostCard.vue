<template>
  <q-card>
    <q-card-section class="bg-primary">
      <q-btn
        flat
        :to="{
          name: 'munin_host',
          params: { host: host },
        }"
      >
      {{host}}
    </q-btn>

    </q-card-section>

    <!-- <q-card-section>
      {{ lorem }}
    </q-card-section> -->

    <q-separator dark />

    <q-card-actions>
      <q-btn
        v-for="category in categories"
        :key="host+'.'+category"
        flat
        :to="{
          name: 'munin_host',
          params: { host: host },
          hash: '#'+category
        }"
      >{{category}}</q-btn>
    </q-card-actions>
  </q-card>

</template>
<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

import * as Debug from 'debug'
const debug = Debug('apps:munin:components:hostCard')

// import JSPipeline from 'js-pipeline'
// import Pipeline from '@apps/munin/pipelines/index'

// import DataSourcesMixin from '@mixins/dataSources'

// import { requests, store } from './sources/index'

export default {
  // mixins: [DataSourcesMixin],
  // extends: DataSourcesMixin,

  name: 'MuninHostCard',

  // pipelines: {},
  // __pipelines_cfg: {},
  // unwatch_store: undefined,
  props: {
    host: {
      type: String,
      default: ''
    },
    categories: {
      type: Array,
      default: function () { return [] }
    }
  },
  data () {
    return {

    }
  }

}
</script>
