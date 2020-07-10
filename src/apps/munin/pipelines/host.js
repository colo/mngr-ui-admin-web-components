'use strict'

// import InputIOApp from '@libs/input/poller/io.app'
import { EventBus } from '@libs/eventbus'

import InputIO from './input/io'

// import DefaultConn from '@etc/default.io'

// const App = require ( 'node-app-socket.io-client/index' )
// let app_io = new App(DefaultConn)

// let buffer = {}

import * as Debug from 'debug'
const debug = Debug('apps:munin:pipelines:host')

let qs = require('qs')

let buffer = []
let buffer_expire = 0
let expire_buffer_timeout = 1000 // one second

import IO from '@etc/munin.io'

let ios = []
Array.each(IO(), function (io, index) {
  ios.push({
    id: 'input.munin.host' + index,
    module: InputIO,
    index: index
  },)
})

export default {
  input: [
    {
      poll: {
        suspended: true,
        id: 'input.munin.host',
        conn: ios,
        // conn: [
        //
        //   Object.merge(
        //     // Object.clone(DefaultConn),
        //     {
        //       id: 'input.munin.host',
        //       module: InputIO
        //
        //     }
        //   )
        //
        // ],
        connect_retry_count: -1,
        connect_retry_periodical: 1000,
        requests: {
          periodical: 5000
        }
      }
    }

  ],
  filters: [
    function (doc, opts, next, pipeline) {
      debug('filter', doc, qs.stringify(doc.metadata.opts.query))
      if (doc.metadata.opts.params && doc.metadata.opts.params.id) {
        doc.id = doc.metadata.opts.params.id
      } else {
        doc.id = doc.metadata.input + '?' + qs.stringify(doc.metadata.opts.query)
      }

      next(doc, opts, next, pipeline)
    }
  ],
  output: [
    // function (payload) {
    //   debug('OUTPUT', payload)
    //
    //   if (!payload.err) { EventBus.$emit('input.munin.host.' + payload.metadata.input, payload) }
    //
    //   // if (!payload.err) { EventBus.$emit('log', payload) }
    // }
    function (payload) {
      if (!payload.err && /^input\.munin.host\[.*\]$/.test(payload.id)) {
        payload.id = payload.id.replace('input.munin.host[', '').slice(0, -1)
        debug('OUTPUT', payload)
        EventBus.$emit('input.munin.host.' + payload.metadata.input, payload)
      }

      // if (!payload.err) { EventBus.$emit('log', payload) }
    }
  ]
}
