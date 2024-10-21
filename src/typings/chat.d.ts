declare namespace Chat {

	interface Chat {
		dateTime: string
		text: string
		error?: boolean
		inversion: boolean
		loading?: boolean
		requestMessage?: { 
			text: string
			image_url?: string
			system?: string
		}
	}

	interface History {
		title: string
		isEdit: boolean
		uuid: string
	}

	interface ChatState {
		active: string | null
		usingContext: boolean;
		history: History[]
		chat: { uuid: string; data: Chat[] }[]
	}
}
