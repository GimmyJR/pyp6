// test-password.js
const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = '123456Gg?';
  const storedHash = '$2a$12$sNxf.B9oHMa7SNqW8muT.ugFbzcQ7iJYoVlk8t/cI/IxkyiJfyi8e';
  
  console.log('Testing password:', password);
  console.log('Stored hash:', storedHash);
  
  const isValid = await bcrypt.compare(password, storedHash);
  console.log('Password valid:', isValid);
  
  // Test what the hash should be
  const newHash = await bcrypt.hash(password, 12);
  console.log('New hash would be:', newHash);
  
  // Test if the new hash would match the stored hash
  const newHashMatch = await bcrypt.compare(password, newHash);
  console.log('New hash matches password:', newHashMatch);
  
}

testPassword();