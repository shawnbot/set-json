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

const testRun = (name, input, args, output) => {
  return test(name, t => {
    return run(input, args)
      .then(res => t.deepEqual(res, output))
  })
}

testRun(
  "it sets a key",
  {}, ["--set.foo=bar"],
  {foo: "bar"}
)

testRun(
  "it sets a nested key",
  {},
  ["--set.foo.bar=baz"],
  {foo: {bar: "baz"}}
)

testRun(
  "sets multiple keys",
  {},
  ["--set.foo=bar", "--set.baz=qux"],
  {foo: "bar", baz: "qux"}
)

testRun(
  "deletes a key",
  {foo: "bar"},
  ["--del=foo"],
  {}
)

testRun(
  "deletes a nested key",
  {foo: {bar: "baz"}},
  ["--del=foo.bar"],
  {foo: {}}
)

testRun(
  "deletes multiple keys",
  {foo: "bar", baz: "qux"},
  ["--del=foo", "--del=baz"],
  {}
)
