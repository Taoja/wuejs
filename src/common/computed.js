const computed = function () {
  const cpt = this.computed
  const cpts = Object.keys(this.computed || {})

  cpts.forEach((e) => {
    const getset = {
      enumerable: true,
      get: () => {
        let val = cpt[e].call(this)
        return val
      }
    }
    Object.defineProperty(this, e, getset)
  })
}

export default computed