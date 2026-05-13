client.on('messageCreate', async msg => {
    // Loglama (İstersen tutabilirsin, konsolu çok doldurur)
    if (msg.guild) console.log(`LOG: S: ${msg.guild.name} M: ${msg.content} Y: ${msg.author.tag}`);

    // Güvenlik Kontrolleri
    if (msg.author.bot || !msg.content.startsWith(prefix)) return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1. Ping Komutu
    if (command === 'ping') {
        // v14'te client.ping yerine client.ws.ping kullanılır
        return msg.reply(`🏓 Pong! **${client.ws.ping}** ms`);
    }

    // 2. SA Komutu (Basit)
    if (command === 'sa') {
        return msg.reply('Aleyküm Selam Reis, hoş geldin! 🦁');
    }

    // 3. Yaz Komutu
    if (command === 'yaz') {
        const mesaj = args.join(' ');
        if (!mesaj) return msg.reply('Yazmam için bir şey belirtmelisin!');
        await msg.delete().catch(() => {});
        return msg.channel.send(mesaj);
    }

    // 4. Temizle Komutu
    if (command === 'temizle') {
        if (!msg.member.permissions.has("ManageMessages")) return msg.reply("Mesajları silmek için yetkin yok!");
        
        await msg.channel.bulkDelete(100, true).catch(err => msg.channel.send("Mesajları silerken bir hata oluştu (14 günden eski mesajlar silinemez)."));
        return msg.channel.send("🧹 **100 adet mesaj silindi! (Hidayet ÇAM)**").then(m => setTimeout(() => m.delete(), 5000));
    }

    // 5. Reboot Komutu
    if (command === 'reboot') {
        if (msg.author.id !== ayarlar.sahip) {
            return msg.reply('Buna yetkin yok Reis, sadece yapımcım kullanabilir!');
        } else {
            await msg.channel.send(`🔄 **Bot yeniden başlatılıyor...**`);
            console.log(`BOT: Bot kullanıcı (${msg.author.tag}) tarafından yeniden başlatıldı.`);
            process.exit(0); // Sharding kullanıyorsan shard otomatik yeniden başlar.
        }
    }
});