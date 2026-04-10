export async function sendTelegramNotification(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  console.log("Attempting Telegram notification...", { 
    hasToken: !!botToken, 
    hasChatId: !!chatId,
    chatId: chatId ? chatId.slice(0, 4) + '...' : 'none'
  })

  if (!botToken || !chatId) {
    const errorMsg = `Telegram credentials missing: ${!botToken ? 'TOKEN' : ''} ${!chatId ? 'CHAT_ID' : ''}`.trim()
    console.error(errorMsg)
    return { success: false, error: errorMsg }
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    const data = await response.json()

    if (!data.ok) {
      console.error("Telegram API Error:", data.description)
      throw new Error(data.description)
    }

    console.log("Telegram notification sent successfully")
    return { success: true }
  } catch (error: any) {
    console.error("Telegram notification failed catch:", error.message || error)
    return { success: false, error: error.message || "Failed to connect to Telegram" }
  }
}
