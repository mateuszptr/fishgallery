const {Client, RichEmbed} = require('discord.js');
const fs = require('fs');
let config;
let prefix;
let galleries;

const client = new Client();

const reload = () => {
    config = JSON.parse(fs.readFileSync('galleryconf.json', "utf8"));
    prefix = config.prefix;
    galleries = new Map();

    config.galleries.forEach((gallery) => {
        let urls = [];
        if(gallery.hasOwnProperty("files")) gallery.files.forEach((file) => {
            const content = fs.readFileSync(config.folder+file, "utf8");
            urls = urls.concat(content.split('\n'));
        });
        if(gallery.hasOwnProperty("subgalleries")) gallery.subgalleries.forEach((subgallery) => {
            urls = urls.concat(galleries.get(subgallery).urls);
        });
        galleries.set(gallery.name, {urls: urls, title: gallery.title, name: gallery.name});
    });

    console.log("Loaded");
};

const displayImage = (gallery, channel) => {
    if(!galleries.has(gallery)) {
        channel.send('Brak galerii ' + gallery);
        return;
    }

    const urls = galleries.get(gallery).urls;
    const url = urls[Math.floor(Math.random()*urls.length)];

    const embed = new RichEmbed()
        .setTitle(galleries.get(gallery).title)
        .setImage(url)
        .setURL(url);

    channel.send(embed);
};

client.on('ready', () => {
    client.user.setActivity(`Type ${prefix}help`, {type: "PLAYING"});
    console.log('Ready');
});

client.on('message', (message) => {
    if(!message.content.toLocaleLowerCase().trim().startsWith(prefix)) return;
    const gallery = message.content.toLocaleLowerCase().trim().replace(new RegExp("^" + prefix), '').trim();
    if(gallery === 'list') {
        let msg = '**Galleries:** ';
        galleries.forEach(gallery => {
            msg = msg + `\`${gallery.name}\` `
        });
        message.channel.send(msg);
    } else if(gallery === 'help') {
        let msg = '';
        msg += `Use \`${prefix}list\` to display the list of galleries\n`;
        msg += `Use \`${prefix}[gallery]\` to get a random image from gallery, for example: \`${prefix}fish\`\n`;
        message.channel.send(msg);
    } else
        displayImage(gallery, message.channel);
});

reload();
client.login(process.env.DISCORD_TOKEN);