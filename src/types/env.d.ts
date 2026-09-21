declare namespace NodeJS {
	interface ProcessEnv {
		TOKEN: string;
		CLIENT_ID: string;
		GUILD_ID: string;
		OWNER_ID: string;
		GEMINI_API_KEY: string;
		DEEPL_API_KEY: string;
		DATABASE: string;
		DB_USER: string;
		DB_PASSWORD: string;
		DB_DIALECT: string;
		DB_HOST: string;
		DB_PORT: string;
		MC_BRIDGE_WS_PORT: string;
		MC_BRIDGE_WS_HOST: string;
		MC_BRIDGE_WS_SECRET: string;
		MC_BRIDGE_GUILD_ID: string;
		MC_BRIDGE_CHANNEL_ID: string;
		SUPPORT_SERVER: string;
	}
}
