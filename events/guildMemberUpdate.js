// Not: return-deep-diff yerine farkları manuel veya daha modern yöntemle izlemek daha sağlıklıdır.
const ddiff = require('return-deep-diff');

module.exports = (oldMember, newMember) => {
    const diff = ddiff(oldMember, newMember);

    if (Object.keys(diff).length > 0) {
        console.log(`[Üye Güncellendi] ${newMember.user.tag}`);
        console.log(diff);
    }
};