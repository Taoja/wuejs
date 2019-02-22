import computed from './common/computed'
import data from './common/data'
import { __empty } from './lib/help'
import watch from './common/watch'

const nativePage = Page
Page = options => {
  const mixins = [
    ...options.mixins || [],
    Wue.mixin
  ]
  options.__wue__ = Wue.__wue__
  if (Array.isArray(mixins)) {
    delete options.mixins
    merge(mixins, options)
  }
  nativePage(options)
}

const properties = ['mounted','created','activated','destroyed','computed','watch','methods','data', 'onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap']

function merge(mixins, options) {
  mixins.reverse().forEach(mixin => {
    if (typeof mixin == 'object') {
      for (let [key, value] of Object.entries(mixin)) {
        if (key === 'data') {
          options.data = Object.assign({}, value, options.data)
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
    onLoad() {
      this.__wue__()
    }
  },
  __wue__() {
    var dataCache = dataCache || {}
    var setDataSwitch = true
    this._setData = function (obj) {
      dataCache = Object.assign(dataCache, obj)
      this.data = Object.assign(this.data, obj)
      if (setDataSwitch && !__empty(dataCache)) {
        setDataSwitch = false
        var st = requestAnimationFrame(() => {
          setDataSwitch = true
          const cpts = Object.keys(this.computed || {})
          cpts.forEach((e) => {
            dataCache[e] = this[e]
          })
          this.setData.call(this, dataCache)
          dataCache = {}
          cancelAnimationFrame(st)
        })
      }
    }

    const methods = Object.keys(this.methods || {})
    methods.forEach((e) => {
      this[e] = this.methods[e]
    })
    
    /** 
     * 重写生命周期名
     * created => onLoad
     * mounted => onReady
     * activated => onShow
     * destroyed => onUnload
     */
    this.created && this.created.call(this)
    this.onReady = this.mounted
    this.onShow = this.activated
    this.onUnload = this.destroyed

    computed.call(this)
    data.call(this)
    watch.call(this)
  }
}