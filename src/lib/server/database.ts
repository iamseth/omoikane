import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export type EventRecord = {
	id: number;
	slug: string;
	admin_token_hash: string;
	title: string;
	description: string | null;
	timezone: string;
	start_date: string;
	end_date: string;
	is_closed: number;
	created_at: string;
	updated_at: string;
};

type CreateEventInput = {
	slug: string;
	adminTokenHash: string;
	title: string;
	description?: string | null;
	timezone: string;
	startDate: string;
	endDate: string;
};

const DEFAULT_DATABASE_PATH = resolve(process.cwd(), 'data/omoikane.sqlite');

let database: Database.Database | null = null;
let isInitialized = false;

export function getDatabasePath() {
	return process.env.DATABASE_PATH ?? DEFAULT_DATABASE_PATH;
}

function connect() {
	if (database) {
		return database;
	}

	const databasePath = getDatabasePath();
	mkdirSync(dirname(databasePath), { recursive: true });

	database = new Database(databasePath);
	database.pragma('foreign_keys = ON');
	database.pragma('journal_mode = WAL');

	return database;
}

export function initDatabase() {
	if (isInitialized) {
		return connect();
	}

	const db = connect();

	db.exec(`
		create table if not exists events (
			id integer primary key autoincrement,
			slug text not null unique,
			admin_token_hash text not null,
			title text not null,
			description text,
			timezone text not null,
			start_date text not null,
			end_date text not null,
			is_closed integer not null default 0,
			created_at text not null default current_timestamp,
			updated_at text not null default current_timestamp,
			check (is_closed in (0, 1)),
			check (start_date <= end_date)
		);

		create table if not exists participants (
			id integer primary key autoincrement,
			event_id integer not null,
			name text not null,
			email text not null,
			created_at text not null default current_timestamp,
			updated_at text not null default current_timestamp,
			unique (event_id, email),
			foreign key (event_id) references events (id) on delete cascade
		);

		create table if not exists availability (
			event_id integer not null,
			participant_id integer not null,
			date text not null,
			unique (participant_id, date),
			foreign key (event_id) references events (id) on delete cascade,
			foreign key (participant_id) references participants (id) on delete cascade
		);

		create index if not exists availability_event_date_idx
			on availability (event_id, date);
	`);

	isInitialized = true;
	return db;
}

export function createEvent(input: CreateEventInput) {
	const db = initDatabase();
	const statement = db.prepare(`
		insert into events (
			slug,
			admin_token_hash,
			title,
			description,
			timezone,
			start_date,
			end_date
		) values (?, ?, ?, ?, ?, ?, ?)
	`);

	const result = statement.run(
		input.slug,
		input.adminTokenHash,
		input.title,
		input.description ?? null,
		input.timezone,
		input.startDate,
		input.endDate
	);

	return getEventById(Number(result.lastInsertRowid));
	}

export function getEventById(id: number) {
	const db = initDatabase();
	return db.prepare('select * from events where id = ?').get(id) as EventRecord | undefined;
}

export function getEventBySlug(slug: string) {
	const db = initDatabase();
	return db.prepare('select * from events where slug = ?').get(slug) as EventRecord | undefined;
}

export function getEventByAdminTokenHash(adminTokenHash: string) {
	const db = initDatabase();
	return db
		.prepare('select * from events where admin_token_hash = ?')
		.get(adminTokenHash) as EventRecord | undefined;
}

export function getEventCount() {
	const db = initDatabase();
	const row = db.prepare('select count(*) as count from events').get() as { count: number };
	return row.count;
}
