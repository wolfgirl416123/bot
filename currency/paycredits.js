const LenoxCommand = require('../LenoxCommand.js');

module.exports = class paycreditsCommand extends LenoxCommand {
	constructor(client) {
		super(client, {
			name: 'paycredits',
			group: 'currency',
			memberName: 'paycredits',
			description: 'Allows a user to give their credits to someone',
			format: 'paycredits {@User} {amount}',
			aliases: [],
			examples: ['paycredits @Monkeyyy11#7584 100'],
			clientpermissions: ['SEND_MESSAGES'],
			userpermissions: [],
			shortDescription: 'Credits',
			dashboardsettings: true
		});
	}

	async run(msg) {
		const langSet = msg.client.provider.getGuild(msg.guild.id, 'language');
		const lang = require(`../../languages/${langSet}.json`);
		const args = msg.content.split(' ').slice(1);

		const mention = msg.mentions.users.first();

		if (!mention) return msg.channel.send(lang.paycredits_nomention);
		if (mention.id === msg.author.id) return msg.channel.send(lang.paycredits_yourself);
		if (args.slice(1).length === 0) return msg.channel.send(lang.paycredits_noinput);
		if (isNaN(args.slice(1))) return msg.channel.send(lang.paycredits_number);
		if (parseInt(args.slice(1).join(' '), 10) === 0) return msg.channel.send(lang.paycredits_not0);
		if (parseInt(args.slice(1).join(' '), 10) < 2) return msg.channel.send(lang.paycredits_one);

		const msgauthortable = msg.client.provider.getUser(msg.author.id, 'credits');

		if (msgauthortable < parseInt(args.slice(1).join(' '), 10)) return msg.channel.send(lang.paycredits_notenough);

		let currentCredits = msg.client.provider.getUser(msg.author.id, 'credits');
		currentCredits -= parseInt(args.slice(1).join(' '), 10);
		await msg.client.provider.setUser(msg.author.id, 'credits', currentCredits);

		let currentCreditsMention = msg.client.provider.getUser(mention.id, 'credits');
		currentCreditsMention += parseInt(args.slice(1).join(' '), 10);
		await msg.client.provider.setUser(mention.id, 'credits', currentCreditsMention);

		const medalsgiven = lang.paycredits_creditsgiven.replace('%author', msg.author).replace('%creditscount', args.slice(1).join(' ')).replace('%mentiontag', mention.tag);
		return msg.channel.send(medalsgiven);
	}
};
