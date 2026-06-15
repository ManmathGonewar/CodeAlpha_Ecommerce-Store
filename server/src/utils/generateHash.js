import bcrypt from 'bcrypt';

const plainTextPassword = process.argv[2];

if (!plainTextPassword) {
  console.error('Usage: npm run hash -- your-password');
  process.exit(1);
}

const hash = await bcrypt.hash(plainTextPassword, 10);
console.log(hash);
