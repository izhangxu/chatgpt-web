declare namespace Chat {

	interface Chat {
		dateTime: string
		text: string
		error?: boolean
		inversion: boolean
		loading?: boolean
	}

	interface History {
		title: string
		isEdit: boolean
		uuid: number
	}

	interface ChatState {
		active: number | null
		usingContext: boolean;
		history: History[]
		chat: { uuid: number; data: Chat[] }[]
	}
}
