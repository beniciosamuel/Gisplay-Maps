import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

export default app => {
    fs.readdirSync(dirname)
    .filter(file => ((file.indexOf('.')) !== 0 && (file !== "index.js")))
    .forEach(file => import('file://' + dirname + '\\' + file).then((module) => {
        module.default(app)
    }));
}

// require(path.resolve(dirname, file))(app)