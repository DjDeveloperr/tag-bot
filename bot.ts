import {
    Client,
    Intents,
    event,
    slash,
    Interaction,
    InteractionResponseType,
    ClientOptions,
} from "./deps.ts";
import { MAX_USER_TAGS, TOKEN } from "./config.ts";
import {
    addTag,
    deleteTag,
    editTag,
    getGuildTags,
    getTag,
    getUserTags,
    init,
} from "./db.ts";
import { commands } from "./commands.ts"

console.log("Init DB");
init();

interface MyClientOptions extends ClientOptions {
    syncCommands?: boolean;
}

class MyClient extends Client {
    syncCommands: boolean = false;

    constructor(options?: MyClientOptions) {
        super(options);
        if (options?.syncCommands === true) this.syncCommands = true;
    }

    @event()
    ready() {
        console.log(`Logged in as ${this.user?.tag}!`);
        if (this.syncCommands) {
            console.log(`Syncing commands...`);
            commands.forEach((cmd) => {
                this.slash.commands
                    .create(cmd)
                    .then((c) => {
                        console.log(`Created CMD ${cmd.name}!`);
                    })
                    .catch(() => console.log(`Failed to create ${cmd.name}.`));
            });
        }
    }

    @slash()
    mytags(d: Interaction) {
        const tags = getUserTags(d.guild.id, d.user.id);
        if (tags.length == 0)
            return d.respond({
                content: `You have no tags in this server yet.`,
                temp: true,
                type: InteractionResponseType.CHANNEL_MESSAGE,
            });
        else {
            d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                temp: true,
                content: `**Your Tags:** ${tags.map((e) => e.name).join(", ")}`,
            });
        }
    }

    @slash()
    alltags(d: Interaction) {
        const tags = getGuildTags(d.guild.id);
        if (tags.length == 0)
            return d.respond({
                content: `This server has no tags yet.`,
                temp: true,
                type: InteractionResponseType.CHANNEL_MESSAGE,
            });
        else {
            d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                temp: true,
                content: `**All Tags:** ${tags.map((e) => e.name).join(", ")}`,
            });
        }
    }

    @slash()
    addtag(d: Interaction) {
        let tags = getUserTags(d.guild.id, d.user.id);
        if (tags.length >= MAX_USER_TAGS)
            return d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                content: `You have reached maximum number of tags!`,
                temp: true,
            });

        let name = d.options.find((e) => e.name == "name")?.value as string;
        let content = d.options.find((e) => e.name == "content")
            ?.value as string;

        if (content.length > 2000)
            return d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                content: `Tag content length must be between 1-2000 characters.`,
                temp: true,
            });

        let added = addTag(d.guild.id, d.user.id, name, content);
        if (added == null) {
            return d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                content: `Tag with name \`${name.replace(/`/g, "`")}\` already exists.`,
                temp: true,
            });
        } else
            return d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                content: `Added new tag: \`${name.replace(/`/g, "`")}\`!`,
                temp: true,
            });
    }

    @slash()
    updatetag(d: Interaction) {
        let name = d.options.find((e) => e.name == "name")?.value as string;
        let content = d.options.find((e) => e.name == "content")
            ?.value as string;

        if (content.length > 2000)
            return d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                content: `Tag content length must be between 1-2000 characters.`,
                temp: true,
            });

        let tag = getTag(d.guild.id, name);
        if (!tag)
            return d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                content: `Tag with name \`${name.replace(
                    /`/g,
                    "`"
                )}\` could not be found.`,
                temp: true,
            });
        if (tag.user != d.user.id)
            return d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                content: `Tag with name \`${name.replace(/`/g, "`")}\` is not your!`,
                temp: true,
            });

        editTag(d.guild.id, name, content);
        d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `Updated tag: \`${name.replace(/`/g, "`")}\`!`,
            temp: true,
        });
    }

    @slash()
    deletetag(d: Interaction) {
        let name = d.options.find((e) => e.name == "name")?.value as string;
        const tag = getTag(d.guild.id, name);
        if (!tag)
            return d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                content: `Tag with name \`${name.replace(
                    /`/g,
                    "`"
                )}\` could not be found.`,
                temp: true,
            });
        if (tag.user != d.user.id)
            return d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                content: `Tag with name \`${name.replace(/`/g, "`")}\` is not your!`,
                temp: true,
            });

        deleteTag(d.guild.id, name);
        d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `Delete tag: \`${name.replace(/`/g, "`")}\`!`,
            temp: true,
        });
    }

    @slash()
    tag(d: Interaction) {
        let name = d.options.find((e) => e.name == "name")?.value as string;
        const tag = getTag(d.guild.id, name);
        if (!tag)
            return d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                content: `Tag with name \`${name.replace(
                    /`/g,
                    "`"
                )}\` could not be found.`,
                temp: true,
            });
        else
            d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: tag.content.replace(/@everyone/g, "@everyоne"),
            });
    }
}

export const client = new MyClient({
    syncCommands: true,
});

if (import.meta.main) {
    console.log(`Connecting...`);
    client.connect(TOKEN, Intents.None);
}
