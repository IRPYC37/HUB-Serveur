// Simple user database (in production, use a real DB)
export const users = [
  {
    id: 1,
    username: "admin",
    // Password: admin123
    password: "$2b$10$K7VqE5xGZxGZxGZxGZxGZ.ZxGZxGZxGZxGZxGZxGZxGZxGZxGZxGZu",
    role: "admin",
  },
  {
    id: 2,
    username: "viewer",
    // Password: viewer123
    password: "$2b$10$V7VqE5xGZxGZxGZxGZxGZ.ZxGZxGZxGZxGZxGZxGZxGZxGZxGZxGZu",
    role: "viewer",
  },
];
