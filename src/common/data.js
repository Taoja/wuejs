const addSetter = function (obj, name) {
  var keys = Object.keys(obj || {})
  keys.forEach((e) => {
    let value = obj[e]
    var define = {
      val: obj[e],
      get: () => {
        return value
      },
      set: (val) => {
        value = val
        if (typeof value == 'object') {
          addSetter.call(this, value, name)
        }
        if (this.watch.hasOwnProperty(name) && this.watch[name].deep) {
          if (typeof this.watch[name] == 'object') {
            this.watch[name].handler.call(this, value, this.data[name])
          } else {
            this.watch[name].call(this, value, this.data[name])
          }
        }
        var sets = {}
        sets[name] = this[name]
        this._setData(sets)
      }
    }
    Object.defineProperty(obj, e, define)
    if (typeof obj[e] == 'object') {
      addSetter.call(this, obj[e], name)
    }
  })
}

const data = function () {
  /**
   * 重写data
   * 将data内容映射到this
   * 给属性复制可直接触发setData
   */
  for (let i in this.data) {
    let getset = {
      get: () => this.data[i],
      set: (value) => {
        if (typeof value == 'object') {
          addSetter.call(this, value, i)
        }
        if (this.watch && this.watch.hasOwnProperty(i)) {
          if (typeof this.watch[i] == 'object') {
            this.watch[i].handler.call(this, value, this.data[i])
          } else {
            this.watch[i].call(this, value, this.data[i])
          }
        }
        var sets = {}
        sets[i] = value
        this._setData(sets)
      }
    }
    Object.defineProperty(this, i, getset)
    if (typeof this.data[i] == 'object') {
      addSetter.call(this, this[i], i)
    }
  }
}

export default data