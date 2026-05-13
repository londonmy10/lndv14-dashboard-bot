const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply("❌ Yetkin yok!");

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

    if (!member || !role) return message.reply("❓ Kullanım: `&rol-ver @kullanıcı @rol`.");

    if (member.roles.cache.has(role.id)) return message.reply("⚠️ Bu kullanıcı zaten bu role sahip.");

    await member.roles.add(role).catch(err => message.reply(`❌ Hata: ${err.message}`));
    
    const embed = new EmbedBuilder()
        .setColor("Random")
        .setDescription(`✅ ${member} adlı üyeye \`${role.name}\` rolü başarıyla verildi.`);

    return message.channel.send({ embeds: [embed] });
};

exports.conf = { enabled: true, guildOnly: true, aliases: ['rolver'], permLevel: 2 };
exports.help = { name: 'rol-ver', kategori: 'yetkili' };