export class DotNotification {
    properties: string[]

    constructor(dotNotification: string) {
        this.properties = dotNotification.split('.')
    }

    exists(obj: any): boolean {
        let exists = false
        for (let property of this.properties) {
            if (typeof obj == 'object' && obj !== null && obj[property] !== undefined) {
                exists = true
                obj = obj[property]
            }
            else {
                exists = false
                break
            }
        }

        return exists
    }

    get(obj: any): any {
        for (let property of this.properties) {
            if (typeof obj == 'object' && obj !== null) {
                obj = obj[property]
            }
            else {
                obj = undefined
                break
            }
        }

        return obj
    }
}