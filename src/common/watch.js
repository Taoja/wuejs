const watch = function () {
  for(let i in this.watch) {
    let watch = this.watch[i]
    if (typeof watch == 'object' && watch.immediate) {
      watch.handler.call(this, this[i], undefined)
    } 
  }
}

export default watch