import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import get from 'lodash';
import set from 'lodash';

const _get = get;
const _set = set;

let logger = console.log
dotenv.config();
let db;
let array_fetch_limit = 1000;

const __replaceId = (match) => {
    if ((typeof match === "object") && match.hasOwnProperty("_id")) {
        try {
            if ((match._id) && (typeof match._id === "string")) {
                match._id = new mongo.ObjectID(match._id);
            } else if ((match._id) && (typeof match._id === "object")) {
                if (typeof match._id["$eq"] === "string") {
                    match._id["$eq"] = new mongo.ObjectID(match._id["$eq"]);
                }
            }
        } catch (ex) {
            match._id = null;
        }
    }
}

const __removeAttribute = (doc, attrName) => {
    if ((typeof doc === "object") && doc.hasOwnProperty(attrName)) {
        try {
            delete doc[attrName];
        } catch (err) {
            logger.warn(err);
            doc[attrName] = null;
        }
    } else if (doc.hasOwnProperty("$set") && (doc["$set"][attrName])) {
        try {
            delete doc["$set"][attrName];
        } catch (err) {
            logger.warn(err);
            doc["$set"][attrName] = null;
        }
    }
}


const url = `mongodb+srv://atlante_avila:${process.env.DBPASS}@cluster0.t8boi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(url);

const dbManager = {};
let dbInstance;

dbManager.initDb = async () => {
    try {
        // Connect the client to the server
        // await client.connect();
        const connection = await client.connect().then(client => client.db())
            .catch(e => console.dir)
        console.log('We have connected to db atlas')
        const dbs = [connection]
        const databases = await Promise.all(dbs);
        dbManager.dbs = databases;
        dbInstance = databases[0]
        return ({
            appDb: databases[0]
        })

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

dbManager.insertOne = (collectionName, doc, options) => {
    return new Promise((resolve, reject) => {
        let collection,
            datestamp = new Date();

        __removeAttribute(doc, "_id");

        doc.created_date = doc.created_date || datestamp;
        doc.date_last_updated = doc.date_last_updated || datestamp;
        collection = dbInstance.collection(collectionName);
        collection.insertOne(doc, options, (err, data) => {
            if (err) {
                logger.error(err);
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

dbManager.insertMany = (collectionName, docs, options) => {
    if (!Array.isArray(docs)) {
        return new Promise.reject(new Error("docs must be an array!"));
    }
    return new Promise((resolve, reject) => {
        let collection,
            datestamp = new Date(),
            updateDocs = docs.map(doc => {
                __removeAttribute(doc, "_id");
                doc.created_date = doc.created_date || datestamp;
                doc.date_last_updated = doc.date_last_updated || datestamp;
                return doc;
            });

        collection = dbInstance.collection(collectionName);
        collection.insertMany(updateDocs, options, (err, data) => {
            if (err) {
                logger.error(err);
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

dbManager.find = (collectionName, query, options) => {

    options = options || {};
    options.limit = options.limit || array_fetch_limit;

    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        __replaceId(query);

        let cursor = collection.find(query).limit(options.limit);

        if (options.sort && Array.isArray(options.sort)) {
            cursor = cursor.sort(options.sort);
        }

        if (options.skip) {
            cursor = cursor.skip(options.skip);
        }

        if (options.project) {
            cursor = cursor.project(options.project);
        }

        cursor.toArray((err, data) => {
            if (err) {
                logger.error(err);
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

dbManager.findOne = (collectionName, query, options) => {

    options = options || {};

    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        __replaceId(query);
        collection.findOne(query, options).then((doc) => {
            return resolve(doc);
        }).catch((err) => {
            logger.error(err);
            return reject(err);
        });
    });
}

dbManager.findOneAndDelete = (collectionName, query, options) => {

    options = options || {};

    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        __replaceId(query);

        collection.findOneAndDelete(query, options).then((result) => {
            if (result.ok === 1) {
                return resolve(result.value);
            } else {
                return reject(result.lastErrorObject);
            }

        }).catch((err) => {
            logger.error(err);
            return reject(err);
        });
    });
}

dbManager.findOneAndReplace = (collectionName, query, replacement, options) => {
    options = options || {};

    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        __replaceId(query);

        collection.findOneAndReplace(query, replacement, options).then((result) => {
            if (result.ok === 1) {
                return resolve(result.value);
            } else {
                return reject(result.lastErrorObject);
            }

        }).catch((err) => {
            logger.error(err);
            return reject(err);
        });
    });
}

dbManager.findOneAndUpdate = (collectionName, query, updates, options) => {
    options = options || {};

    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        __replaceId(query);

        collection.findOneAndUpdate(query, updates, options).then((result) => {
            if (result.ok === 1) {
                return resolve(result.value);
            } else {
                return reject(result.lastErrorObject);
            }

        }).catch((err) => {
            logger.error(err);
            return reject(err);
        });
    });
}

dbManager.count = (collectionName, query, options) => {

    options = options || {};
    options.limit = options.limit || array_fetch_limit; //should be externalized and set in the config object

    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);

        __replaceId(query);

        let cursor = collection.find(query).limit(options.limit);

        if (options.sort && Array.isArray(options.sort)) {
            cursor = cursor.sort(options.sort);
        }

        if (options.skip) {
            cursor = cursor.skip(options.skip);
        }

        if (options.project) {
            cursor = cursor.project(options.project);
        }

        cursor.count((err, data) => {
            if (err) {
                logger.error(err);
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

dbManager.forEach = (collectionName, query, options, iteratorCallback) => {

    options = options || {};

    if (typeof iteratorCallback !== "function") {
        return Promise.reject(new Error("iteratorCallback function is required!"));
    }

    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        __replaceId(query);

        let cursor = collection.find(query);

        if (options.sort && Array.isArray(options.sort)) {
            cursor = cursor.sort(options.sort);
        }

        if (options.skip) {
            cursor = cursor.skip(options.skip);
        }

        if (options.project) {
            cursor = cursor.project(options.project);
        }

        cursor.forEach(iteratorCallback, (err) => {
            if (err) {
                logger.error(err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

dbManager.distinct = (collectionName, key, query, options) => {
    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        collection.distinct(key, query, options || {}, (err, data) => {
            if (err) {
                logger.error(err);
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

dbManager.createIndex = (collectionName, fieldSpec, options) => {
    return new Promise((resolve, reject) => {
        dbInstance.createIndex(collectionName, fieldSpec, options).then(resolve).catch((err) => {
            logger.error(err);
            return reject(err);
        });
    });
}
dbManager.drop = (collectionName) => {
    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        collection.drop().then(resolve).catch((err) => {
            logger.error(err);
            return reject(err);
        });
    });
}

dbManager.indexes = (collectionName) => {
    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        collection.indexes().then(resolve).catch((err) => {
            logger.error(err);
            return reject(err);
        });
    });
}

dbManager.dropIndex = (collectionName, indexName, options) => {
    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        collection.dropIndex(indexName, options).then(resolve).catch((err) => {
            logger.error(err);
            reject(err);
        });
    });
}

dbManager.deleteOne = (collectionName, query, options) => {
    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        __replaceId(query);
        collection.deleteOne(query, options || {}, (err, data) => {
            if (err) {
                logger.error(err);
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

dbManager.deleteMany = (collectionName, query, options) => {
    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        __replaceId(query);
        collection.deleteMany(query, options || {}, (err, data) => {
            if (err) {
                logger.error(err);
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

dbManager.updateOne = (collectionName, query, doc, options) => {
    return new Promise((resolve, reject) => {

        doc = doc || {};

        __replaceId(query);

        __removeAttribute(doc, "_id");
        __removeAttribute(doc, "date_last_updated");

        let current_date_spec = _get(doc, "$currentDate", {});
        current_date_spec.date_last_updated = true;
        _set(doc, "$currentDate", current_date_spec);

        let collection = dbInstance.collection(collectionName);
        collection.updateOne(query, doc, options, (err, data) => {
            if (err) {
                logger.error(err);
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

dbManager.updateMany = (collectionName, query, doc, options) => {
    return new Promise((resolve, reject) => {

        doc = doc || {};

        __replaceId(query);
        __removeAttribute(doc, "_id");
        __removeAttribute(doc, "date_last_updated");

        let current_date_spec = _get(doc, "$currentDate", {});
        current_date_spec.date_last_updated = true;
        _set(doc, "$currentDate", current_date_spec);

        let collection = dbInstance.collection(collectionName);
        collection.updateMany(query, doc, options, (err, data) => {
            if (err) {
                logger.error(err);
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

dbManager.bulkWrite = (collectionName, operations, options) => {
    return new Promise((resolve, reject) => {
        let collection = dbInstance.collection(collectionName);
        collection.bulkWrite(operations, options || {}, (err, data) => {
            if (err) {
                logger.error(err);
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

dbManager.listCollections = (filter, options) => {
    return new Promise((resolve, reject) => {
        dbInstance.listCollections(filter || {}, options || {}).toArray((err, data) => {
            if (err) {
                logger.error(err);
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

export default dbManager;