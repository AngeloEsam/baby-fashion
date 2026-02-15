import TelegramBot from 'node-telegram-bot-api';

class TelegramService {
    constructor() {
        this.enabled = false;
        this.bot = null;
        this.chatId = null;
        this.init();
    }

    init() {
        if (this.enabled) return true;

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        console.log('🔍 Telegram Init - Token existing:', !!token, 'ChatID:', chatId);

        if (token && chatId) {
            try {
                this.bot = new TelegramBot(token, { polling: false });
                this.chatId = chatId;
                this.enabled = true;
                console.log('✅ Telegram notifications enabled for Chat ID:', chatId);
                return true;
            } catch (err) {
                console.error('❌ Failed to initialize Telegram Bot:', err.message);
                return false;
            }
        }
        return false;
    }

    async sendOrderNotification(order) {
        if (!this.enabled && !this.init()) {
            console.log('⚠️ Telegram notification skipped: service not initialized (missing config)');
            return;
        }

        try {
            const itemsList = order.items
                .map((item, i) => `  ${i + 1}. ${item.name} (${item.size}) x${item.quantity} — ${item.price * item.quantity} EGP`)
                .join('\n');

            const message =
                `🛒 <b>New Order Received!</b>\n\n` +
                `👤 <b>Customer:</b> ${order.customerName}\n` +
                `📞 <b>Phone:</b> ${order.phone}\n` +
                `📍 <b>Location:</b> ${order.location}\n` +
                `${order.notes ? `📝 <b>Notes:</b> ${order.notes}\n` : ''}` +
                `\n📦 <b>Items:</b>\n${itemsList}\n\n` +
                `💰 <b>Total:</b> ${order.totalAmount} EGP\n` +
                `⏰ <b>Time:</b> ${new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo', hour12: true })}`;

            await this.bot.sendMessage(this.chatId, message, { parse_mode: 'HTML' });
            console.log('📨 Telegram: New order notification sent');
        } catch (error) {
            console.error('❌ Telegram Error (New Order):', error.message);
            if (error.response && error.response.body) {
                console.error('Detailed Error:', error.response.body);
            }
        }
    }

    async sendStatusUpdateNotification(order) {
        if (!this.enabled && !this.init()) return;

        try {
            const statusEmoji = {
                'pending': '⏳',
                'confirmed': '✅',
                'delivered': '🚚',
                'cancelled': '❌'
            }[order.status] || 'ℹ️';

            const message =
                `${statusEmoji} <b>Order Status Updated</b>\n\n` +
                `🆔 <b>Order ID:</b> <code>${order._id}</code>\n` +
                `👤 <b>Customer:</b> ${order.customerName}\n` +
                `📊 <b>New Status:</b> ${order.status.toUpperCase()}\n` +
                `💰 <b>Total:</b> ${order.totalAmount} EGP\n` +
                `⏰ <b>Updated at:</b> ${new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo', hour12: true })}`;

            await this.bot.sendMessage(this.chatId, message, { parse_mode: 'HTML' });
            console.log(`📨 Telegram: Status update (${order.status}) sent`);
        } catch (error) {
            console.error('❌ Telegram Error (Status Update):', error.message);
        }
    }
}

// Singleton instance
const telegramService = new TelegramService();
export default telegramService;
