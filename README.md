# set-json
![](	https://img.shields.io/npm/v/set-json.svg)

Update one or more JSON files in place with a simple command line syntax.

## Usage
```sh
echo "{}" > test.json

# set the "bar" key
set-json --set.foo=bar test.json
# test.json is now:
# {"foo": "bar"}

# delete the "foo" key
set-json --del foo test.json
# {}

# set a nested key
set-json --set.foo.bar.baz=qux test.json
# {"foo": {"bar": {"baz": "qux"}}}

echo "{"a": {"b": "c"}}" > from.json
set-json --copy from.json:a test.json
# {"foo": {"bar": {"baz": "qux"}}, "a": {"b": "c"}}
```

## Installation
```
npm install set-json
```

## API
Run `set-json --help` for more info.
