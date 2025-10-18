// MongoDB initialization script
db = db.getSiblingDB('buenro_db');

// Create a user for the application
db.createUser({
  user: 'buenro_user',
  pwd: 'buenro_password',
  roles: [
    {
      role: 'readWrite',
      db: 'buenro_db'
    }
  ]
});

// Create indexes for better performance
// Note: Collection is named 'properties'
db.properties.createIndex({ "createdAt": 1 });
db.properties.createIndex({ "source": 1 });
db.properties.createIndex({ "batchId": 1 });

// Create unique compound index to prevent duplicates from multiple runs
try {
  db.properties.createIndex({ "source": 1, "originalId": 1 }, { unique: true });
  print('Created unique index on properties collection');
} catch (error) {
  if (error.code === 11000) {
    print('Index creation failed due to existing duplicates. Skipping index creation.');
    print('The application will handle duplicates gracefully during insertion.');
  } else {
    print('Note: Index creation skipped - ' + error.message);
  }
}

print('Database initialized successfully!');