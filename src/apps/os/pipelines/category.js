'use strict'

// import InputIOApp from '@libs/input/poller/io.app'
import { EventBus } from '@libs/eventbus'

import InputIO from './input/io'

// import DefaultConn from '@etc/default.io'

// const App = require ( 'node-app-socket.io-client/index' )
// let app_io = new App(DefaultConn)

import * as Debug from 'debug'
const debug = Debug('apps:os:pipelines:category')

let qs = require('qs')

let buffer = []
let buffer_expire = 0
let expire_buffer_timeout = 5000 // one second

import IO from '@etc/os.io'

let ios = []
Array.each(IO(), function (io, index) {
  ios.push({
    id: 'input.os.category' + index,
    module: InputIO,
    index: index
  },)
})

export default {
  input: [
    {
      poll: {
        suspended: true,
        id: 'input.os.category',
        conn: ios,
        // conn: [
        //
        //   Object.merge(
        //     // Object.clone(DefaultConn),
        //     {
        //       id: 'input.os.category',
        //       module: InputIO
        //
        //     }
        //   )
        //
        // ],
        connect_retry_count: -1,
        connect_retry_periodical: 1000,
        requests: {
          periodical: 500
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
    },
    // function (doc, opts, next, pipeline) {
    //   debug('MERGE %o %o', doc, buffer, pipeline.get_input_by_id('input.os.category').conn_pollers)
    //
    //   let timeout
    //
    //   let _merge = function () {
    //     debug('TO MERGE %o', buffer)
    //     let merged_doc = {id: undefined, data: undefined, metadata: {}}
    //     Array.each(buffer, function (_doc) {
    //       merged_doc.id = _doc.id
    //
    //       merged_doc.data = _deep_merge(_doc.data, merged_doc.data)
    //       // if (Array.isArray(_doc.data)) {
    //       //   merged_doc.data = []
    //       //   merged_doc.data.combine(_doc.data)
    //       // } else {
    //       //   merged_doc.data = {}
    //       //   merged_doc.data = Object.merge(merged_doc.data, _doc.data)
    //       // }
    //
    //       merged_doc.metadata = Object.merge(merged_doc.metadata, _doc.metadata)
    //     })
    //     buffer = []
    //     // buffer_expire = Date.now() + expire_buffer_timeout
    //     // clearTimeout(timeout)
    //     next(merged_doc, opts, next, pipeline)
    //   }
    //
    //   let _deep_merge = function (val1, val2) {
    //     if (val2 === undefined) { return val1 }
    //
    //     if (Array.isArray(val1)) {
    //       if (!Array.isArray(val2)) {
    //         val2 = [val2]
    //       }
    //
    //       return val1.combine(val2)
    //     } else {
    //       Object.each(val1, function (data, prop) {
    //         if (val2[prop]) {
    //           val1[prop] = _deep_merge(data, val2[prop])
    //         }
    //       })
    //     }
    //
    //     return val1
    //   }
    //
    //   // if (buffer.length === 0) { buffer_expire = Date.now() + expire_buffer_timeout } // start counting expire time on first doc
    //
    //   if (buffer.length === Object.getLength(pipeline.get_input_by_id('input.os.category').conn_pollers)) { // || buffer_expire < Date.now()
    //     _merge()
    //   } else {
    //     buffer.push(doc)
    //     // if (buffer.length === 1) { timeout = setTimeout(_merge, expire_buffer_timeout) }
    //   }
    // }
  ],
  output: [
    // function (payload) {
    //   debug('OUTPUT', payload)
    //
    //   if (!payload.err) { EventBus.$emit('input.os.category.' + payload.metadata.input, payload) }
    //
    //   // if (!payload.err) { EventBus.$emit('log', payload) }
    // }
    function (payload) {
      if (!payload.err && /^input\.os\.category\[.*\]$/.test(payload.id)) {
        payload.id = payload.id.replace('input.os.category[', '').slice(0, -1)
        debug('OUTPUT', payload)
        EventBus.$emit('input.os.category.' + payload.metadata.input, payload)
      }

      // if (!payload.err) { EventBus.$emit('log', payload) }
    }
  ]
}
