const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { stripIndents } = require('common-tags');

exports.run = (client, message, args) => {
  const p = message.member.permissions;
  
  const check = (perm) => p.has(perm) ? "✅" : "❌";

  const embed = new EmbedBuilder()
    .setTitle(`🛡️ ${message.author.username} - Yetki Bilgileri`)
    .setColor("Blue")
    .setDescription(stripIndents`
      \`\`\`diff
      ${check(PermissionFlagsBits.Administrator)} Yönetici
      ${check(PermissionFlagsBits.ViewAuditLog)} Denetim Kaydını Görüntüle
      ${check(PermissionFlagsBits.ManageGuild)} Sunucuyu Yönet
      ${check(PermissionFlagsBits.ManageRoles)} Rolleri Yönet
      ${check(PermissionFlagsBits.ManageChannels)} Kanalları Yönet
      ${check(PermissionFlagsBits.KickMembers)} Üyeleri At
      ${check(PermissionFlagsBits.BanMembers)} Üyeleri Yasakla
      ${check(PermissionFlagsBits.ManageMessages)} Mesajları Yönet
      ${check(PermissionFlagsBits.ManageNicknames)} Kullanıcı Adlarını Yönet
      ${check(PermissionFlagsBits.ManageEmojisAndStickers)} Emojileri Yönet
      ${check(PermissionFlagsBits.ManageWebhooks)} Webhook'ları Yönet
      \`\`\`
    `)
    .setTimestamp();

  return message.channel.send({ embeds: [embed] });
};

exports.conf = { enabled: true, guildOnly: true, aliases: ['yetkiler', 'izinlerim'], permLevel: 0 };
exports.help = { name: 'yetkilerim', kategori: 'genel' };