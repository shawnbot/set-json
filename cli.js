#!/usr/bin/env node
const dot = require("dot-component")
const fse = require("fs-extra")
const yargs = require("yargs")
  .option("set", {
    describe: "Set key 'x' in the form --set.x=foo",
    alias: "s",
  })
  .option("copy", {
    describe: "Copy key 'x' from file.json in the form: --copy=file.json:x",
    alias: "c",
  })
  .option("del", {
    describe: "Delete the provided key",
    alias: "d",
  })
const opts = yargs.argv
const args = opts._

const ops = []

if (opts.set && typeof opts.set === "object") {
  Object.entries(opts.set).forEach(([key, val]) => {
    ops.push(json => {
      dot.set(json, key, val)
      return json
    })
  })
}

if (opts.copy) {
  const [file, key] = opts.copy.split(":")
  if (file && key) {
    console.warn("copying '%s' from %s...", key, file)
    ops.push(json => {
      return fse.readFile(file, UTF)
        .then(JSON.parse)
        .then(data => dot.get(data, key))
        .then(data => dot.set(json, key, data))
        .then(() => json)
    })
  } else {
    console.error(
      "malformed --copy directive; expected 'file:key', got '%s'",
      opts.copy
    )
    process.exit(1)
  }
}

if (opts.del) {
  const dels = Array.isArray(opts.del) ? opts.del : [opts.del]
  dels.forEach(key => {
    ops.push(json => {
      dot.set(json, key, undefined)
      return json
    })
  })
}

const UTF = "utf8"

const tasks = args.map(filename => {
  return fse.readFile(filename, UTF)
    .then(JSON.parse)
    .then(json => {
      return Promise.all(
        ops.map(op => op(json) || json)
      ).then(() => json)
    })
    .then(json => JSON.stringify(json, null, "  "))
    .then(str => fse.writeFile(filename, `${str}\n`, UTF))
    .then(() => filename)
})

Promise.all(tasks)
  .catch(error => {
    console.log(error)
    process.exit(1)
  })
  .then(files => {
    if (files.length > 1) {
      console.warn("wrote %d files", files.length)
    } else {
      console.warn("wrote %s:", files[0])
      return fse.readFile(files[0], UTF)
        .then(str => console.warn(str))
    }
  })
  .then(() => process.exit(0))
