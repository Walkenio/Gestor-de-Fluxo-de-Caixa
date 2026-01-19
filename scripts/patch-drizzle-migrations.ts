import fs from 'fs';
import path from 'path';

const migrationsDir = path.resolve('./server/db/migrations');

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    content = content.replace(
        /ALTER TABLE ([\s\S]*?) ADD CONSTRAINT ([\s\S]*?);/g,
        (match) => {
            return `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '${match.match(/"([^"]+)"$/)?.[1]}'
    ) THEN
        ${match}
    END IF;
END $$;
`;
        }
    );

    fs.writeFileSync(filePath, content);
}

console.log('✔ Migrations patched (constraints safe)');
