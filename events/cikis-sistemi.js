const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('quick.db');
const Canvas = require('canvas');

// Yazı tipini bir kez kaydetmek yeterlidir
Canvas.registerFont('ay.otf', { family: 'SONGER' });

module.exports = async (member) => {
    // Veritabanı verilerini çekiyoruz
    const memberChannelId = await db.get(`gcc_${member.guild.id}`);
    const isGoldMember = await db.get(`üyelikk_${member.id}`);

    // Gold üye değilse veya kanal ayarlanmamışsa dur
    if (!isGoldMember || !memberChannelId) return;

    const kanal = member.guild.channels.cache.get(memberChannelId);
    if (!kanal) return;

    // Canvas İşlemleri
    const canvas = Canvas.createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');

    try {
        // Arka plan resmini yükle
        const background = await Canvas.loadImage('https://i.hizliresim.com/7Br6Av.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Yazı ayarları
        ctx.fillStyle = `#ffffff`;
        ctx.font = `80px "SONGER"`;
        ctx.textAlign = "center";
        ctx.fillText(`${member.user.username.toUpperCase()}`, 640, 350);

        // Avatar İşlemleri
        // v14'te avatarURL() bir fonksiyondur ve dinamik uzantı alabilir
        const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
        const avatar = await Canvas.loadImage(avatarURL);

        // Yuvarlak Avatar Çizimi
        ctx.save(); // Mevcut durumu kaydet
        ctx.beginPath();
        ctx.arc(640, 110, 55, 0, Math.PI * 2, true); // Orta noktaya göre ayarlandı
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 585, 55, 110, 110);
        ctx.restore(); // Kırpmayı sadece avatar için uygula

        // Dosyayı hazırla (v14 AttachmentBuilder)
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'vortex.png' });

        // Embed oluştur (v14 EmbedBuilder)
        const embed = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`${member.user.username} adlı Gold üye sunucudan ayrıldı.`);

        // Mesajları gönder
        await kanal.send({ embeds: [embed], files: [attachment] });

    } catch (e) {
        console.error("Görsel oluşturulurken hata çıktı:", e);
    }
};