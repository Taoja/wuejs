const computed = function () {
  const cpt = this.computed
  const cpts = Object.keys(this.computed || {})

  cpts.forEach((e) => {
    const getset = {
      enumerable: true,
      get: () => {
        let val = cpt[e].call(this)
        if (this.watch && this.watch.hasOwnProperty(e)) {
          if (typeof this.watch[e] == 'object') {
            this.watch[e].handler.call(this, val, this.data[e])
          } else {
            this.watch[e].call(this, val, this.data[e])
          }
        }
        return val
      }
    }
    Object.defineProperty(this, e, getset)
  })
}

export default computed