import parsePhoneNumber, {isValidPhoneNumber} from "libphonenumber-js"
import {create, Whatsapp, Message, SocketState} from "venom-bot"

export type QRCode = {
    base64Qr: string
    asciiQR: string
    attempts: number
    urlCode?: string
}

class Sender{
    private client: Whatsapp
    private connected: boolean
    private qr : QRCode

    get isConnected() : boolean {
        return this.connected
    }

    
    get qrCode() : QRCode {
        return this.qr
    }
    
    
    constructor() {
        this.initializer()
    }

    async sendText(to: string, body: string) {
        
        if(!isValidPhoneNumber(to, "BR")){
            throw new Error("This Number is not Valid")
        }

        let phoneNumber = parsePhoneNumber(to, "BR")
        ?.format("E.164")
        ?.replace("+", "") as string

        phoneNumber = phoneNumber.includes("@c.us")
        ? phoneNumber 
        : `${phoneNumber}@c.us`

        console.log("phoneNumber", phoneNumber)
     
        await this.client.sendText(phoneNumber, body)
    }

    private initializer() {
        const qr = (
            base64Qr: string, 
            asciiQR: string, 
            attempts: number,) => {
            this.qr = {base64Qr, asciiQR, attempts,}
        }

        const status = (statusSession: string) => {
            this.connected = ["isLogged", "qrReadSucess", "chatsAvailable"]
            .includes(statusSession)
        }

        const start = (client: Whatsapp) => {
            this.client = client

            client.onStateChange((state) => {
                this.connected = state === SocketState.CONNECTED
            })

            // client.onAnyMessage((message: Message) => {
            //     console.log(message)
                
            // })
        }

        create("sender-dev", qr, status)
        .then((client) => start(client))
        .catch((error) => console.error(error))
    }
}

export default Sender