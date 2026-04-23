import { pgTable, integer, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const files = pgTable("files", {
    id: uuid("id").defaultRandom().primaryKey(),

    // basic file and folder information
    name: text("name").notNull(),
    path: text("path").notNull(), // /document/project/resume.pdf
    size: integer("size").notNull(),
    type: text("type").notNull(), // "folder"

    // Storage information
    fileUrl: text("file_url").notNull(), // url to access the file,
    thumbnailUrl: text("thumbnail_url"),

    // Ownership
    userId: text("user_id").notNull(),
    parentId: uuid("parent_id"), // Parent folder id (null for root items)

    // file or folder flags
    isFolder: boolean("is_folder").default(false).notNull(),
    isStared: boolean("is_stared").default(false).notNull(),
    isTrash: boolean("is_trash").default(false).notNull(),

    // Time stamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

/*
parent : Each file/folder can have one parent folder.
Children : Each file or folder can have many child.
*/
export const filesRelations = relations(files, ({ one, many }) => (
    {
        parent: one(files, {
            fields: [files.parentId],
            references: [files.id]
        }),

        // relationship to child files/folder
        childern: many(files)
    }
))

// Type definitions
export const File = typeof files.$inferSelect;
export const NewFile = typeof files.$inferInsert;