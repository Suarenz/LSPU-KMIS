import https from 'https';

function getPublicIP(): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = https.get('https://api.ipify.org', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data.trim());
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  try {
    const ip = await getPublicIP();
    console.log(`Your public IP address is: ${ip}`);
    console.log('\nTo fix the database connection:');
    console.log('1. Go to Azure Portal > PostgreSQL Server (lspu-kmis-db)');
    console.log('2. Navigate to "Connection security"');
    console.log('3. Add a new firewall rule with your IP address:');
    console.log(`   - Start IP: ${ip}`);
    console.log(`   - End IP: ${ip}`);
    console.log('4. Also ensure "Allow access to Azure services" is set to "Yes"');
  } catch (error) {
    console.error('Error getting IP address:', error);
  }
}

main();