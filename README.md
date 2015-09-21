# yams
Alexa → Yamaha receiver

An Alexa app for controlling Yamaha recievers.

## Usage

```
$ npm install
$ npm install -g gulp
$ gulp && node lib/index.js
```

This will generate utterances to `udderances.txt` and compile ES6 to `lib/`.
Before running this you'll want to edit the `utterances.txt` and `mappings.json`
files to create input mappings, then copy the contents of `udderances.txt` to
the Echo console, along with `intents.json`.

Included is a lambda function as well. Shove that guy into Lambda and make sure
to edit the `postToServer` function to add your actual hostname.

Yams will find your receiver using SSDP and exposes endpoints for powering on
and off, turning volume up and down, and switching inputs (via mappings or best
guess).
