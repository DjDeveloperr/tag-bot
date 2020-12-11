import { SlashCommandOptionType, SlashCommandPartial } from "./deps.ts"

export const commands: SlashCommandPartial[] = [
    {
        name: "mytags",
        description: "See a list of tags made by you!",
        options: [],
    },
    {
        name: "alltags",
        description: "See a list of tags in this server!",
        options: [],
    },
    {
        name: "addtag",
        description: "Create a new tag in this server!",
        options: [
            {
                name: "name",
                description: "Name of the tag.",
                required: true,
                type: SlashCommandOptionType.STRING,
            },
            {
                name: "content",
                description: "New content of the tag.",
                required: true,
                type: SlashCommandOptionType.STRING,
            },
        ],
    },
    {
        name: "updatetag",
        description: "Update your tag's response.",
        options: [
            {
                name: "name",
                description: "Name of the tag.",
                required: true,
                type: SlashCommandOptionType.STRING,
            },
            {
                name: "content",
                description: "New content of the tag.",
                required: true,
                type: SlashCommandOptionType.STRING,
            },
        ],
    },
    {
        name: "deletetag",
        description: "Delete a tag of yours.",
        options: [
            {
                name: "name",
                description: "Name of the tag.",
                required: true,
                type: SlashCommandOptionType.STRING,
            },
        ],
    },
    {
        name: "tag",
        description: "Send a tag's contents.",
        options: [
            {
                name: "name",
                description: "Name of the tag.",
                required: true,
                type: SlashCommandOptionType.STRING,
            },
        ],
    },
];