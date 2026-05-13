const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('quick.db');
const Canvas = require('canvas');

// Font kaydı (Dosya yolunun doğru olduğundan emin ol)
Canvas.registerFont('ay.otf', { family: 'SONGER' });

module.exports = async (member) => {
    const user = member.user;
    const guild = member.guild;

    // Veritabanı kontrolleri
    const isGoldMember = await db.get(`üyelikk_${user.id}`);
    const memberChannelId = await db.get(`gcc_${guild.id}`);

    // Eğer gold üye değilse veya kanal ayarlanmamışsa işlemi durdur
    if (!isGoldMember || !memberChannelId) return;

    const kanal = guild.channels.cache.get(memberChannelId);
    if (!kanal) return;

    // Canvas İşlemleri
    const canvas = Canvas.createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');

    try {
        // Arka planı yükle
        const background = await Canvas.loadImage('https://i.hizliresim.com/7Br6Av.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Yazı Ayarları
        ctx.fillStyle = `#ffffff`;
        ctx.font = `80px "SONGER"`;
        ctx.textAlign = "center";
        ctx.fillText(`${user.username.toUpperCase()}`, 640, 350);

        // Avatarı Yükle
        const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
        const avatar = await Canvas.loadImage(avatarURL);

        // Yuvarlak Avatar Maskeleme
        ctx.save();
        ctx.beginPath();
        ctx.arc(640, 110, 55, 0, Math.PI * 2, true); // Orta noktaya göre hizalandı
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 585, 55, 110, 110);
        ctx.restore();

        // Dosyayı Hazırla (v14 AttachmentBuilder)
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'gold-giris.png' });

        // Embed Oluştur (v14 EmbedBuilder)
        const embed = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`🌟 **${user.username}** adlı Gold üye sunucuya katıldı! Hoş geldin.`);

        // Mesajları Gönder
        await kanal.send({ embeds: [embed], files: [attachment] });

    } catch (e) {
        console.error("Gold giriş resmi oluşturulurken hata:", e);
    }
};