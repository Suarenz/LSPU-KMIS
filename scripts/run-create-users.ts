import createDefaultUsers from './create-default-users';

// Direct execution of the create users function
console.log('Starting to create default users in Supabase...');
createDefaultUsers().then(() => {
  console.log('User creation process completed!');
}).catch((error) => {
  console.error('Error during user creation:', error);
});