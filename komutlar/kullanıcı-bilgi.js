const { EmbedBuilder, ActivityType } = require('discord.js');
const moment = require('moment');
const db = require('croxydb');
require('moment-duration-format');

exports.run = async (client, message, args) => {
    moment.locale("tr");

    // Kullanıcıyı Bulma (Etiket, ID veya İsim)
    let user = message.mentions.users.first() || 
               client.users.cache.get(args[0]) || 
               (args.length > 0 ? client.users.cache.find(e => e.username.toLowerCase().includes(args.join(" ").toLowerCase())) : message.author) || 
               message.author;

    const member = message.guild.members.cache.get(user.id);
    if (!member) return message.reply("❌ Bu kullanıcı bu sunucuda bulunamadı.");

    // Durum ve Emoji Ayarları (v14 cache yapısı)
    const durumEmoji = {
        online: client.emojis.cache.get('716299276770213898') || '🟢',
        offline: client.emojis.cache.get('716299275805524099') || '⚪',
        idle: client.emojis.cache.get('716299276929466449') || '🟡',
        dnd: client.emojis.cache.get('716299276413829160') || '🔴'
    };

    const statusMap = {
        online: "Çevrimiçi",
        offline: "Çevrimdışı/Görünmez",
        idle: "Boşta",
        dnd: "Rahatsız Etmeyin"
    };

    const userStatus = member.presence ? member.presence.status : "offline";
    const durm = `${durumEmoji[userStatus]} ${statusMap[userStatus]}`;
    
    // Oyun/Aktivite Bilgisi
    const activity = member.presence?.activities[0];
    const oyun = activity ? `${activity.type === ActivityType.Custom ? '' : activity.name} ${activity.state || ''}` : 'Şu an bir şey oynamıyor.';

    // Tarihler
    const kurulus = moment(user.createdAt).format("LLL");
    const katilma = moment(member.joinedAt).format("LLL");

    // Veritabanı Verileri (croxydb)
    const mesaj = db.get(`msayar_${user.id}`) || 0;
    const karakter = db.get(`karakter_${user.id}`) || 0;
    const ses_suresi_raw = db.get(`${user.id}_sesdedur`) || 0;
    const ses_suresi = Math.round(ses_suresi_raw / 60) + " dakika";

    // Katılma Sırası Hesabı
    const katilmaSirasi = message.guild.members.cache
        .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
        .map(m => m.id)
        .indexOf(user.id) + 1;

    const botemoji = client.emojis.cache.get('724219372281004112') || '🤖';

    // Embed Oluşturma
    const embed = new EmbedBuilder()
        .setColor(member.displayHexColor || "Blue")
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setAuthor({ name: `${user.tag} Kullanıcı Bilgileri`, iconURL: user.displayAvatarURL() })
        .addFields(
            { name: "📋 Genel Bilgiler", value: stripIndents`
                **» Etiket:** \`${user.tag}\`
                **» ID:** \`${user.id}\`
                **» Sunucu Adı:** \`${member.nickname || 'Yok'}\`
                **» Bot mu?:** ${user.bot ? botemoji : "Hayır."}
            `, inline: false },
            { name: "📅 Tarihler", value: stripIndents`
                **» Hesap Kuruluş:** \`${kurulus}\`
                **» Sunucuya Giriş:** \`${katilma}\`
                **» Katılma Sırası:** \`${katilmaSirasi}/${message.guild.memberCount}\`
            `, inline: false },
            { name: "🎮 Durum Bilgisi", value: stripIndents`
                **» Durum:** ${durm}
                **» Oynuyor:** \`${oyun}\`
            `, inline: false },
            { name: "🎭 Rolleri", value: member.roles.cache.filter(r => r.name !== "@everyone").map(r => r).join(' **|** ') || 'Hiç rolü yok.', inline: false },
            { name: "📊 İstatistikler", value: stripIndents`
                **» Mesaj:** Toplam **${mesaj}** mesaj (**${karakter}** karakter).
                **» Ses:** Toplam **${ses_suresi}** boyunca seslide kaldı.
            `, inline: false }
        )
        .setFooter({ text: `Legends Never Die | Bilgi Sistemi`, iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

// Yardımcı fonksiyon
function stripIndents(strings, ...values) {
    const result = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
    return result.split('\n').map(line => line.trim()).join('\n');
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['kullanıcı', 'i', 'kb', 'me'],
    permLevel: 0
};

exports.help = {
    name: 'kullanıcı-bilgi',
    kategori: 'genel',
    description: 'Etiketlenen veya ID\'si girilen kullanıcı hakkında detaylı bilgi verir.',
    usage: 'kullanıcı-bilgi [@kullanıcı/ID]'
};