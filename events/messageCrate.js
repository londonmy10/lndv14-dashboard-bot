const db = require('croxydb');
if (db.get(`karalist_${message.author.id}`)) return; // Kara listedeyse cevap verme

// Küfür Engel Kontrolü
const kufurDurum = db.get(`kufurengel_sistemi_${message.guild.id}`);
if (kufurDurum === "acik") {
    const kufurler = ["küfür1", "küfür2"]; // Burayı genişlet
    if (kufurler.some(word => message.content.toLowerCase().includes(word))) {
        message.delete();
        return message.channel.send(`${message.author}, bu sunucuda küfür yasak aslanım! 🦁`);
    }
}