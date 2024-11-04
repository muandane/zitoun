import { type ZitadelError, errorMessages } from "@/domain/models";

export function formatZitadelError(error: ZitadelError): string {
	const fieldMatch = error.message.match(/invalid AddHumanUserRequest\.(\w+):/);
	if (fieldMatch?.[1]) {
		const field = fieldMatch[1].toLowerCase();
		if (error.code === 3 && field in errorMessages[3]) {
			return errorMessages[3][field as keyof (typeof errorMessages)[3]];
		}
	}
	return "Failed to create user. Please check your input and try again.";
}
