const { ShardingManager, WebhookClient } = require('discord.js');
const ayarlar = require('./ayarlar.json');

// ShardingManager Yapılandırması
const shards = new ShardingManager('./bot.js', { 
    token: ayarlar.token,
    totalShards: 'auto',
    timeout: 90000, // Süreyi 90 saniyeye çıkardık; ShardingReadyTimeout hatasını önler.
    respawn: true   // Shard çökerse otomatik olarak yeniden başlatır.
});

// WebhookClient Yapılandırması
const webhook = new WebhookClient({ 
    id: "1496322819007447110", 
    token: "5WoV_EmJaG4AtCdD9h05JO-RprFHilInrAXsW_nD6cG4W2o5Q_GHKaeIRfE1C2kxIhaW" 
});

shards.on('shardCreate', shard => {
    console.log(`[${new Date().toLocaleString()}] #${shard.id} ID'li Shard başlatıldı.`);

    webhook.send({
        content: `<a:baglaniyor:742313028933910591> **[Başlatılıyor]** ${shard.id + 1}. Shard Discord'a bağlanmaya çalışıyor!`
    }).catch(() => {});

    shard.on('ready', () => {
        console.log(`[${new Date().toLocaleString()}] #${shard.id} ID'li Shard hazır.`);
        webhook.send({
            content: `<a:baglandi:742312990069751809> **[Başlatıldı]** ${shard.id + 1}. Shard başarıyla bağlandı!`
        }).catch(() => {});
    });

    shard.on('disconnect', () => {
        webhook.send({
            content: `⚠️ **[Bağlantı Kesildi]** ${shard.id + 1}. Shard'ın bağlantısı koptu!`
        }).catch(() => {});
    });

    shard.on('reconnecting', () => {
        webhook.send({
            content: `🔄 **[Yeniden Bağlanıyor]** ${shard.id + 1}. Shard yeniden bağlanıyor...`
        }).catch(() => {});
    });
});

// Shardları başlat
shards.spawn({ amount: 'auto', delay: 5500, timeout: 90000 }).catch(err => {
    console.error("[HATA] Shardlar başlatılamadı:", err);
});
