const fse = require("fs-extra")
const pify = require("util").promisify
const spawn = require("child_process").spawn
const test = require("ava")
const tmp = require("tmp-promise")

const CLI = require.resolve("../cli.js")
const UTF = "utf8"

const tmpJSON = data => {
  return tmp.file()
    .then(({path}) => {
      return fse.writeFile(path, JSON.stringify(data), UTF)
        .then(() => path)
    })
}

const run = (data, args) => {
  return tmpJSON(data)
    .then(path => {
      args.push(path)
      return new Promise((resolve, reject) => {
        const cli = spawn(CLI, args)
        cli.on("close", code => code ? reject(code) : resolve(code))
      })
      .then(() => fse.readFile(path, UTF))
      .then(content => JSON.parse(content))
    })
}

const testRun = (input, args, output) => {
  return t => run(input, args).then(res => t.deepEqual(res, output))
}

test("it sets a key",
     testRun({}, ["--set.foo=bar"], {foo: "bar"}))

test("it sets a nested key",
     testRun({}, ["--set.foo.bar=baz"], {foo: {bar: "baz"}}))

test("sets multiple keys",
     testRun({}, ["--set.foo=bar", "--set.baz=qux"], {foo: "bar", baz: "qux"}))

test("deletes a key",
     testRun({foo: "bar"}, ["--del=foo"], {}))

test("deletes a nested key",
     testRun({foo: {bar: "baz"}}, ["--del=foo.bar"], {foo: {}}))

test("deletes multiple keys",
     testRun({foo: "bar", baz: "qux"}, ["--del=foo", "--del=baz"], {}))

test("copies a key", t => {
  const from = {x: {y: "z"}}
  return tmpJSON(from).then(path => {
    return testRun({}, [`--copy=${path}:x`], from)(t)
  })
})
