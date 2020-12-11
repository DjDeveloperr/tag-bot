# Tag Bot

This is a simple Discord bot for tags, powered by the new Slash Commands API. Made using [Harmony](https://github.com/harmony-org/harmony).

## Getting started

Make a new file `config.ts` and copy contents from `config-example.ts`, paste your bot's token and that's it! Then just use `deno run --allow-net --allow-read --allow-write bot.ts`. Note that when using bot for first time, there's a Client Option in the end `syncCommands`, keep it `true` for first time then toggle it to `false`. It can take max 1 hour for Global Slash Commands (i.e. not per Guild) to sync with Discord Client.

Copyright 2020 @ DjDeveloperr