import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const files = pgTable("files", {
  // unique idetifier
  id: uuid("id").defaultRandom().primaryKey(),

  // file information
  name: text("name").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(),

  // storage information
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),

  // ownership
  userId: text("user_id").notNull(),
  parentId: uuid("parent_id"),

  // file type/stage
  isFolder: boolean("is_folder").default(false).notNull(),
  isStarred: boolean("is_starred").default(false).notNull(),
  isTrash: boolean("is_trash").default(false).notNull(),

  // timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// files relations
export const fileRelations = relations(files, ({ one, many }) => ({
  parent: one(files, {
    fields: [files.parentId],
    references: [files.id],
  }),

  children: many(files),
}));

// type defination
export const File = typeof files.$inferSelect;
export const NewFile = typeof files.$inferInsert;
