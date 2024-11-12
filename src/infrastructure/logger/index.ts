export const logger = {
	info: (message: string, metadata?: object) => {
		const logEntry = {
			level: "info",
			timestamp: new Date().toISOString(),
			message,
			...metadata,
		};
		console.log(JSON.stringify(logEntry));
	},
	debug: (message: string, metadata?: object) => {
		const logEntry = {
			level: "debug",
			timestamp: new Date().toISOString(),
			message,
			...metadata,
		};
		console.debug(JSON.stringify(logEntry));
	},
	error: (message: string, errorObject?: unknown, metadata?: object) => {
		const error =
			errorObject instanceof Error
				? { message: errorObject.message, stack: errorObject.stack }
				: errorObject;

		console.error(
			JSON.stringify({
				level: "error",
				timestamp: new Date().toISOString(),
				message,
				error,
				...metadata,
			}),
		);
	},
};
