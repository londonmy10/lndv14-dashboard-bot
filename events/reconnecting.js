module.exports = (client, shardId) => {
    // v14'te shardId hangi shard'ın bağlandığını belirtir
    const zaman = new Date().toLocaleString('tr-TR');
    console.log(`[${zaman}] Yeniden başlatılıyor Reis! (Shard: ${shardId || 0})`);
};