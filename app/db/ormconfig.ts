import { Taxonomy } from "./entities/Taxonomy";
import { Enzyme } from "./entities/Enzyme";
import { ImportRecord } from "./entities/ImportRecord";
import { ImportFile } from "./entities/ImportFile";
import { Sample } from "./entities/Sample";

export const ormConfig = {
    type: 'sqlite',
    synchronize: true,
    logging: false,
    logger: 'simple-console',
    database: 'database.sqlite',
    entities: [Taxonomy, Enzyme, ImportRecord, ImportFile, Sample]
}
