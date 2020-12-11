import { Client, Intents, event, slash, Interaction, InteractionResponseType, Embed, SlashCommandPartial, SlashCommandOptionType } from 'https://raw.githubusercontent.com/DjDeveloperr/harmony/slash/mod.ts'
import { MAX_USER_TAGS, TOKEN } from "./config.ts";
import { addTag, deleteTag, editTag, getGuildTags, getTag, getUserTags, init } from "./db.ts";

console.log('Init DB');
init();

const commands: SlashCommandPartial[] = [];

commands.push({
    name: 'mytags',
    description: 'See a list of tags made by you!',
    options: []
})

commands.push({
    name: 'alltags',
    description: 'See a list of tags in this server!',
    options: []
})

commands.push({
    name: 'addtag',
    description: 'Create a new tag in this server!',
    options: [
        {
            name: 'name',
            description: 'Name of the tag.',
            required: true,
            type: SlashCommandOptionType.STRING
        },
        {
            name: 'content',
            description: 'New content of the tag.',
            required: true,
            type: SlashCommandOptionType.STRING
        }
    ]
})

commands.push({
    name: 'updatetag',
    description: 'Update your tag\'s response.',
    options: [
        {
            name: 'name',
            description: 'Name of the tag.',
            required: true,
            type: SlashCommandOptionType.STRING
        },
        {
            name: 'content',
            description: 'New content of the tag.',
            required: true,
            type: SlashCommandOptionType.STRING
        }
    ]
})

commands.push({
    name: 'deletetag',
    description: 'Delete a tag of yours.',
    options: [
        {
            name: 'name',
            description: 'Name of the tag.',
            required: true,
            type: SlashCommandOptionType.STRING
        }
    ]
})

commands.push({
    name: 'tag',
    description: 'Send a tag\'s contents.',
    options: [
        {
            name: 'name',
            description: 'Name of the tag.',
            required: true,
            type: SlashCommandOptionType.STRING
        }
    ]
})

class MyClient extends Client {
    @event()
    ready() {
        console.log(`Logged in as ${this.user?.tag}!`)
        // commands.forEach(cmd => {
        //     this.slash.commands.create(cmd).then(c => {
        //         console.log(`Created CMD ${cmd.name}!`)
        //     }).catch(() => console.log(`Failed to create ${cmd.name}.`))
        // })
    }

    @slash()
    mytags(d: Interaction) {
        const tags = getUserTags(d.guild.id, d.user.id)
        if (tags.length == 0) return d.respond({ content: `You have no tags in this server yet.`, temp: true, type: InteractionResponseType.CHANNEL_MESSAGE })
        else {
            d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                temp: true,
                content: `**Your Tags:** ${tags.map(e => e.name).join(', ')}`
            });
        }
    }

    @slash()
    alltags(d: Interaction) {
        const tags = getGuildTags(d.guild.id)
        if (tags.length == 0) return d.respond({ content: `This server has no tags yet.`, temp: true, type: InteractionResponseType.CHANNEL_MESSAGE })
        else {
            d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                temp: true,
                content: `**All Tags:** ${tags.map(e => e.name).join(', ')}`
            })
        }
    }

    @slash()
    addtag(d: Interaction) {
        let tags = getUserTags(d.guild.id, d.user.id);
        if(tags.length >= MAX_USER_TAGS) return d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `You have reached maximum number of tags!`,
            temp: true,
        })

        let name = d.data.options.find(e => e.name == 'name')?.value as string;
        let content = d.data.options.find(e => e.name == 'content')?.value as string;

        if(content.length > 2000) return d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `Tag content length must be between 1-2000 characters.`,
            temp: true,
        })

        let added = addTag(d.guild.id, d.user.id, name, content);
        if(added == null) {
            return d.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE,
                content: `Tag with name \`${name.replace(/`/g, "\`")}\` already exists.`,
                temp: true,
            })
        } else return d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `Added new tag: \`${name.replace(/`/g, "\`")}\`!`,
            temp: true,
        })
    }

    @slash()
    updatetag(d: Interaction) {
        let name = d.data.options.find(e => e.name == 'name')?.value as string;
        let content = d.data.options.find(e => e.name == 'content')?.value as string;

        if(content.length > 2000) return d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `Tag content length must be between 1-2000 characters.`,
            temp: true,
        })

        let tag = getTag(d.guild.id, name)
        if(!tag) return d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `Tag with name \`${name.replace(/`/g, "\`")}\` could not be found.`,
            temp: true,
        })
        if(tag.user != d.user.id) return d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `Tag with name \`${name.replace(/`/g, "\`")}\` is not your!`,
            temp: true,
        })

        editTag(d.guild.id, name, content)
        d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `Updated tag: \`${name.replace(/`/g, "\`")}\`!`,
            temp: true,
        })
    }

    @slash()
    deletetag(d: Interaction) {
        let name = d.data.options.find(e => e.name == 'name')?.value as string;
        const tag = getTag(d.guild.id, name);
        if (!tag) return d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `Tag with name \`${name.replace(/`/g, "\`")}\` could not be found.`,
            temp: true,
        })
        if(tag.user != d.user.id) return d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `Tag with name \`${name.replace(/`/g, "\`")}\` is not your!`,
            temp: true,
        })

        deleteTag(d.guild.id, name)
        d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `Delete tag: \`${name.replace(/`/g, "\`")}\`!`,
            temp: true,
        })
    }

    @slash()
    tag(d: Interaction) {
        let name = d.data.options.find(e => e.name == 'name')?.value as string;
        const tag = getTag(d.guild.id, name);
        if (!tag) return d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE,
            content: `Tag with name \`${name.replace(/`/g, "\`")}\` could not be found.`,
            temp: true,
        })
        else d.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            content: tag.content.replace(/@everyone/g, '@everyоne'),
        })
    }
}

console.log('Connecting...');
const client = new MyClient();
client.connect(TOKEN, Intents.None);