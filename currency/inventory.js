const LenoxCommand = require('../LenoxCommand.js');
const Discord = require('discord.js');
const marketitemskeys = require('../../marketitems-keys.json');

module.exports = class inventoryCommand extends LenoxCommand {
	constructor(client) {
		super(client, {
			name: 'inventory',
			group: 'currency',
			memberName: 'inventory',
			description: 'Shows you your inventory',
			format: 'inventory [upgrade]',
			aliases: ['inv'],
			examples: ['inventory', 'inventory upgrade'],
			clientpermissions: ['SEND_MESSAGES'],
			userpermissions: [],
			shortDescription: 'General',
			dashboardsettings: true
		});
	}

	async run(msg) {
		const langSet = msg.client.provider.getGuild(msg.guild.id, 'language');
		const lang = require(`../../languages/${langSet}.json`);
		const prefix = msg.client.provider.getGuild(msg.guild.id, 'prefix');
		const args = msg.content.split(' ').slice(1);

		const inventory = lang.inventory_inventory.replace('%authortag', msg.author.tag);
		const validation = ['upgrade'];

		for (let i = 0; i < args.slice().length; i++) {
			if (validation.indexOf(args.slice()[i].toLowerCase()) >= 0) {
				if (args.slice()[0].toLowerCase() === 'upgrade') {
					if (msg.client.provider.getUser(msg.author.id, 'inventory').inventoryslotticket === 0) return msg.reply(lang.inventory_notickets);
					const currentInventory = msg.client.provider.getUser(msg.author.id, 'inventory');
					currentInventory.inventoryslotticket -= 1;
					msg.client.provider.setUser(msg.author.id, 'inventory', currentInventory);

					let currentInventoryslots = msg.client.provider.getUser(msg.author.id, 'inventoryslots');
					currentInventoryslots += 1;
					msg.client.provider.setUser(msg.author.id, 'inventoryslots', currentInventoryslots);

					const ticketbought = lang.inventory_ticketbought.replace('%currentslots', `\`${msg.client.provider.getUser(msg.author.id, 'inventoryslots')}\``);
					return msg.reply(ticketbought);
				}
			}
		}

		const itemsnames = [];
		for (const x in marketitemskeys) {
			itemsnames.push(x);
		}

		let inventoryslotcheck = 0;
		for (let x = 0; x < itemsnames.length; x++) {
			inventoryslotcheck += parseInt(msg.client.provider.getUser(msg.author.id, 'inventory')[itemsnames[x]], 10);
		}

		const slots = lang.inventory_inventoryslots.replace('%slots', `**${inventoryslotcheck}/${msg.client.provider.getUser(msg.author.id, 'inventoryslots')}**`);
		const embed = new Discord.MessageEmbed()
			.setDescription(slots)
			.setAuthor(inventory, msg.author.displayAvatarURL())
			.setColor('#009933');

		const array1 = [];
		const array2 = [];

		let check = 0;
		/* eslint guard-for-in: 0 */
		for (const i in msg.client.provider.getUser(msg.author.id, 'inventory')) {
			if (msg.client.provider.getUser(msg.author.id, 'inventory')[i] === 0) {
				check++;
			}

			const error = lang.inventory_error.replace('%prefix', prefix);
			if (check === Object.keys(msg.client.provider.getUser(msg.author.id, 'inventory')).length) return msg.reply(error);
			if (msg.client.provider.getUser(msg.author.id, 'inventory')[i] !== 0) {
				array1.push(`${msg.client.provider.getBotsettings('botconfs', 'market')[i][0]} ${msg.client.provider.getUser(msg.author.id, 'inventory')[i]}x ${lang[`loot_${i}`]}`);
				array2.push(`**${lang.inventory_price}** 📥 $${msg.client.provider.getBotsettings('botconfs', 'market')[i][1]} 📤 $${msg.client.provider.getBotsettings('botconfs', 'market')[i][2]}`);
			}
		}

		if (array1.length <= 7) {
			for (let i = 0; i < array1.length; i++) {
				embed.addField(array1[i], array2[i]);
			}
			return msg.channel.send({
				embed
			});
		}

		const firstembed = array1.slice(0, 7);
		const secondembed = array2.slice(0, 7);

		for (let i = 0; i < firstembed.length; i++) {
			embed.addField(firstembed[i], secondembed[i]);
		}

		const message = await msg.channel.send({
			embed
		});

		await message.react('◀');
		await message.react('▶');

		let firsttext = 0;
		let secondtext = 7;

		const collector = message.createReactionCollector((reaction, user) => user.id === msg.author.id, {
			time: 30000
		});
		collector.on('collect', r => {
			const reactionadd = array1.slice(firsttext + 7, secondtext + 7).length;
			const reactionremove = array1.slice(firsttext - 7, secondtext - 7).length;

			if (r.emoji.name === '▶' && reactionadd !== 0) {
				r.users.remove(msg.author.id);
				const embedaddfield1 = array1.slice(firsttext + 7, secondtext + 7);
				const embedaddfield2 = array2.slice(firsttext + 7, secondtext + 7);

				firsttext += 7;
				secondtext += 7;

				const newembed = new Discord.MessageEmbed()
					.setDescription(slots)
					.setAuthor(inventory, msg.author.displayAvatarURL())
					.setColor('#009933');

				for (let i = 0; i < embedaddfield1.length; i++) {
					newembed.addField(embedaddfield1[i], embedaddfield2[i]);
				}

				message.edit({
					embed: newembed
				});
			} else if (r.emoji.name === '◀' && reactionremove !== 0) {
				r.users.remove(msg.author.id);
				const embedaddfield1 = array1.slice(firsttext - 7, secondtext - 7);
				const embedaddfield2 = array2.slice(firsttext - 7, secondtext - 7);

				firsttext -= 7;
				secondtext -= 7;

				const newembed = new Discord.MessageEmbed()
					.setDescription(slots)
					.setAuthor(inventory, msg.author.displayAvatarURL())
					.setColor('#009933');

				for (let i = 0; i < embedaddfield1.length; i++) {
					newembed.addField(embedaddfield1[i], embedaddfield2[i]);
				}

				message.edit({
					embed: newembed
				});
			}
		});
		collector.on('end', () => {
			message.react('❌');
		});
	}
};
