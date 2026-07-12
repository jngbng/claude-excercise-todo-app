import { pgTable, serial, varchar, text, integer, date, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const tickets = pgTable(
  'tickets',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 }).notNull().default('BACKLOG'),
    priority: varchar('priority', { length: 10 }).notNull().default('MEDIUM'),
    position: integer('position').notNull().default(1),
    plannedStartDate: date('planned_start_date'),
    dueDate: date('due_date'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().default(sql`now()`),
    updatedAt: timestamp('updated_at').notNull().default(sql`now()`).$onUpdate(() => new Date()),
  },
  (table) => [
    index('idx_tickets_status_position').on(table.status, table.position),
    index('idx_tickets_due_date').on(table.dueDate),
  ],
);
