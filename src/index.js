import computed from './common/computed'
import data from './common/data'
import { __empty } from './lib/help'
import watch from './common/watch'

const page = options => {
  const properties = ['mounted','created','activated','destroyed','computed','watch','methods','data', 'onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap']
  const mixins = [
    ...options.mixins || [],
    Wue.mixin
  ]
  if (Array.isArray(mixins)) {
    delete options.mixins
    merge(mixins, options, properties)
  }
  options.methods = options.methods || {}
  options.methods.__wue__ = Wue.__wue__
  const methods = Object.keys(options.methods || {})
  methods.forEach((e) => {
    options[e] = options.methods[e]
  })
  /** 
   * 重写生命周期名
   * created => onLoad
   * mounted => onReady
   * activated => onShow
   * destroyed => onUnload
   */
  options.onReady = options.mounted
  options.onShow = options.activated
  options.onUnload = options.destroyed
  options.onLoad = options.created
  Page(options)
}

const component = options => {
  const params = ['mounted','created','destroyed','computed','watch','methods','data', 'created', 'ready', 'attached', 'moved', 'detached', 'error', 'properties', 'behaviors']
  const mixins = [
    ...options.mixins || [],
    Wue.mixin
  ]
  options.data = options.data || {}
  options.methods = options.methods || {}
  options.methods.__wue__ = Wue.__wue__
  options.data.__c = options.computed || {}
  options.data.__w = options.watch || {}
  if (Array.isArray(mixins)) {
    merge(mixins, options, params)
  }

  var props = options.props || {}
  var properties = {}
  for (let key in props) {
    properties[key] = {
      type: props[key].type,
      value: props[key].default,
      observer(e, f, g) {
        if (typeof props[key].observer == 'function') {
          props[key].observer.call(this, e, f, g)
        }
        this[key] = e
      }
    }
  }
  options.properties = {
    ...options.properties,
    ...properties
  }
  delete options.computed
  delete options.watch
  delete options.mixins
  delete options.props
  /** 
   * 重写生命周期名
   * created => created
   * mounted => ready
   * activated => pageLifetimes.show
   * deactivated => pageLifetimes.hide
   * destroyed => detached
   */
  options.ready = options.mounted
  options.pageLifetimes = {
    show: options.activated,
    hide: options.deactivated
  }
  options.detached = options.destroyed
  Component(options)
}

function merge(mixins, options, properties) {
  mixins.reverse().forEach(mixin => {
    if (typeof mixin == 'object') {
      for (let [key, value] of Object.entries(mixin)) {
        if (key === 'data') {
          options.data = Object.assign({}, value, options.data)
        } else if (key === 'watch') {
          options.data.__w = {
            ...options.data.__w,
            ...value
          }
        } else if (key === 'computed') {
          options.data.__c = {
            ...options.data.__c,
            ...value
          }
        } else if (properties.includes(key)) {
          let native = options[key]
          options[key] = function (...args) {
            value.call(this, ...args)
            return native && native.call(this, ...args)
          }
        } else {
          options = Object.assign({}, mixin, options)
        }
      }
    }
  })
}

const Wue = {
  mixin: {
    created() {
      this.__wue__()
    }
  },
  __wue__() {
    if (this.data && this.data.hasOwnProperty('__c')) {
      this.computed = this.data.__c
      this.watch = this.data.__w
      delete this.data.__c
      delete this.data.__w
    }
    var dataCache = dataCache || {}
    var setDataSwitch = true
    this._setData = function (obj) {
      dataCache = Object.assign(dataCache, obj)
      this.data = Object.assign(this.data, obj)
      if (setDataSwitch && !__empty(dataCache)) {
        setDataSwitch = false
        wx.nextTick(() => {
          setDataSwitch = true
          const cpts = Object.keys(this.computed || {})
          cpts.forEach((e) => {
            dataCache[e] = this[e]
          })
          // console.log(`setData{${Object.keys(dataCache)}}`)
          this.setData.call(this, dataCache)
          dataCache = {}
        })
      }
    }
    data.call(this)
    computed.call(this)
    watch.call(this)
  }
}

export {
  page,
  component
}