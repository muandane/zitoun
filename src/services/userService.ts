import type { CreateUserRequest } from "@/domain/models";
import { createZitadelUser } from "@/infrastructure/createUser";

export async function handleUserCreation(userData: CreateUserRequest) {
	// Validate user data if needed
	return await createZitadelUser(userData);
}
