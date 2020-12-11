import { DB } from "https://deno.land/x/sqlite/mod.ts"
export const db = new DB("./data/tags.sqlite");

export interface Tag {
    id: number
    user: string
    guild: string
    uname: string
    name: string
    content: string
    created: string
}

export function init() {
    db.query(`CREATE TABLE IF NOT EXISTS tags(id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, guild TEXT, name TEXT, uname TEXT, content TEXT, created TEXT)`)
}

export function getUserTags(guild: string, user: string) {
    return [...db.query(`SELECT * FROM tags WHERE user = ? AND guild = ?`, [user, guild]).asObjects()]
}

export function getGuildTags(guild: string) {
    return [...db.query(`SELECT * FROM tags WHERE guild = ?`, [guild]).asObjects()]
}

export function getTag(guild: string, name: string) {
    return [...db.query(`SELECT * FROM tags WHERE guild = ? AND uname = ?`, [guild, name.toLowerCase()]).asObjects()][0]
}

export function deleteTag(guild: string, name: string): boolean {
    if (!getTag(guild, name)) return false
    db.query(`DELETE FROM tags WHERE guild = ? AND uname = ?`, [guild, name.toLowerCase()])
    return true
}

export function editTag(guild: string, name: string, update: string) {
    if (!getTag(guild, name)) return false
    db.query(`UPDATE tags SET content = ? WHERE guild = ? AND uname = ?`, [update, guild, name.toLowerCase()])
    return getTag(guild, name)
}

export function addTag(guild: string, user: string, name: string, content: string) {
    if (getTag(guild, name)) return null
    db.query(`INSERT INTO tags (user, guild, uname, name, content, created) VALUES (?, ?, ?, ?, ?, ?)`, [user, guild, name.toLowerCase(), name, content, new Date().getTime()])
    return getTag(guild, name)
}

if(import.meta.main) {
    init();
}