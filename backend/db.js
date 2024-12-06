import { Surreal } from 'surrealdb';

export default class DB {
    constructor() {
        this._db = new Surreal();
    }

    async connect() {
        await this._db.connect("wss://quixi-chat-069pekqfmhv4j69m7sv8kvujp8.aws-use1.surreal.cloud/rpc", {
            namespace: "quixichat",
            database: "quixichat",
            /*
            auth: {
                username: "Quixichat",
                password: "_quixichat123_",
            },
            */
        });
        await this._db.signin({
            namespace: 'quixichat',
            database: 'quixichat',
            username: 'Quixichat',
            password: '_quixichat123_',
        })
    }

    async get(table, query) {
        const _result = await this._db.query(`
            SELECT * FROM ${table} WHERE ${query}
        `);
        return _result[0];
    }

    async insert(table, data) {
        const _ = await this._db.insert(table, data);
        return _;
    }

    async disconnect() {
        await this._db.close();
    }
}