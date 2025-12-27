DELETE FROM users WHERE email = 'admin@lspu.edu.ph';
INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt") 
VALUES (
  gen_random_uuid(), 
  'admin@lspu.edu.ph', 
  'Admin User', 
  '$2b$10$48eUZc7Fi77mle4hm4qsL.dKZ5xr5f8hAfAQwDVmN20dqsjA/UpMC',
  'ADMIN', 
  NOW(), 
  NOW()
);
