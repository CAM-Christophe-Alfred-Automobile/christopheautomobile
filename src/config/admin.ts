interface AdminConfig {
  password: string;
  sessionSecret: string;
}

export const adminConfig: AdminConfig = {
  password: process.env.ADMIN_PASSWORD!,
  sessionSecret: process.env.ADMIN_SESSION_SECRET!,
};
