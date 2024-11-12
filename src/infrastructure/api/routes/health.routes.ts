import { Elysia } from "elysia";

export const healthService = new Elysia()
	.get(
		"/healthz",
		() => {
			return { status: "ok" };
		},
		{
			detail: {
				tags: ["Health"],
				description: "Service Health Check",
			},
		},
	);
