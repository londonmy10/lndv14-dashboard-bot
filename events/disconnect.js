module.exports = (client, event, shardId) => {
    console.log(`[${new Date().toLocaleString()}] Bağlantın koptu Reis! Shard: ${shardId || 0}`);
    console.warn("Bağlantı kesilme detayı:", event);
};