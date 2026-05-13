const { AttachmentBuilder } = require('discord.js');
const db = require('quick.db');
const Canvas = require('canvas');

// Yazı tipini kaydediyoruz
Canvas.registerFont('ay.otf', { family: 'SONGER' });

module.exports = async (member) => {
    const user = member.user;
    const guild = member.guild;

    // Veritabanı kontrolleri
    const memberChannelId = await db.get(`gcc_${guild.id}`);
    const isBlacklisted = await db.get(`karalist_${user.id}`);
    const isGoldMember = await db.get(`üyelikk_${user.id}`);

    // Kanal ayarlanmamışsa hiçbir şey yapma
    if (!memberChannelId) return;

    const kanal = guild.channels.cache.get(memberChannelId);
    if (!kanal) return;

    // 1. KONTROL: Kara Liste
    if (isBlacklisted) {
        return kanal.send("⚠️ **Yasaklı kullanıcı geldi. Lütfen DİKKATLİ olun!**");
    }

    // 2. KONTROL: Gold Üye (Eğer gold üyeyse resim göndermeyip durduruyor - senin kodundaki mantık)
    if (isGoldMember) return;

    // 3. AŞAMAM: Görsel Oluşturma (Normal kullanıcılar için)
    const canvas = Canvas.createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');

    try {
        // Arka planı yükle
        const background = await Canvas.loadImage('https://cdn.discordapp.com/attachments/621045237137276929/623246660948197423/da.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Yazı Ayarları
        ctx.fillStyle = `#ffffff`;
        ctx.font = `80px "SONGER"`;
        ctx.textAlign = "center";
        ctx.fillText(`${user.username.toUpperCase()}`, 640, 350);

        // Avatarı Yükle
        const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
        const avatar = await Canvas.loadImage(avatarURL);

        // Yuvarlak Avatar Çizimi
        ctx.save();
        ctx.beginPath();
        ctx.arc(640, 110, 55, 0, Math.PI * 2, true); 
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 585, 55, 110, 110);
        ctx.restore();

        // Dosyayı hazırla
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'vortex-giris.png' });

        // Kanala gönder
        await kanal.send({ files: [attachment] });

    } catch (e) {
        console.error("Giriş görseli oluşturulurken hata:", e);
    }
};