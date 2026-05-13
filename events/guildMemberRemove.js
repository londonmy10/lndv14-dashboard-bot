module.exports = async (member) => {
    const { guild, user } = member;

    // 1. Kullanıcıya Özel Mesaj (DM) Gönderme
    try {
        await member.send('Niye gittin? 🦁');
    } catch (e) {
        // Kullanıcı DM'lerini kapatmış olabilir, bu durumda bot hata vermesin diye boş bırakıyoruz
        console.log(`${user.tag} adlı kullanıcıya DM gönderilemedi (DM kapalı olabilir).`);
    }

    // 2. Sunucuya Ayrılma Mesajı Gönderme
    // v14'te defaultChannel olmadığı için botun mesaj gönderebileceği ilk kanalı buluyoruz
    const channel = guild.channels.cache
        .filter(c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages'))
        .first();

    if (channel) {
        try {
            await channel.send(`${user.username} sunucudan ayrıldı.`);
        } catch (e) {
            console.error("Kanal mesajı gönderilemedi:", e.message);
        }
    }
};