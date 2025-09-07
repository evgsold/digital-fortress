#!/usr/bin/env node

/**
 * Firebase Firestore Index Deployment Script
 * 
 * This script deploys Firestore indexes and security rules to your Firebase project.
 * Make sure you have Firebase CLI installed and are logged in.
 * 
 * Usage:
 * node deploy-indexes.js [project-id]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const INDEXES_FILE = 'firestore.indexes.json';
const RULES_FILE = 'firestore.rules';

function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI is installed');
  } catch (error) {
    console.error('❌ Firebase CLI is not installed. Please install it first:');
    console.error('npm install -g firebase-tools');
    process.exit(1);
  }
}

function checkFiles() {
  const indexesPath = path.join(__dirname, INDEXES_FILE);
  const rulesPath = path.join(__dirname, RULES_FILE);
  
  if (!fs.existsSync(indexesPath)) {
    console.error(`❌ ${INDEXES_FILE} not found`);
    process.exit(1);
  }
  
  if (!fs.existsSync(rulesPath)) {
    console.error(`❌ ${RULES_FILE} not found`);
    process.exit(1);
  }
  
  console.log('✅ Index and rules files found');
}

function validateIndexesFile() {
  try {
    const indexesContent = fs.readFileSync(INDEXES_FILE, 'utf8');
    const indexes = JSON.parse(indexesContent);
    
    if (!indexes.indexes || !Array.isArray(indexes.indexes)) {
      throw new Error('Invalid indexes structure');
    }
    
    console.log(`✅ Found ${indexes.indexes.length} composite indexes`);
    console.log(`✅ Found ${indexes.fieldOverrides?.length || 0} field overrides`);
    
  } catch (error) {
    console.error('❌ Invalid indexes file:', error.message);
    process.exit(1);
  }
}

function deployIndexes(projectId) {
  console.log('\n🚀 Deploying Firestore indexes...');
  
  try {
    const command = projectId 
      ? `firebase deploy --only firestore:indexes --project ${projectId}`
      : 'firebase deploy --only firestore:indexes';
      
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Indexes deployed successfully');
  } catch (error) {
    console.error('❌ Failed to deploy indexes:', error.message);
    process.exit(1);
  }
}

function deployRules(projectId) {
  console.log('\n🚀 Deploying Firestore security rules...');
  
  try {
    const command = projectId 
      ? `firebase deploy --only firestore:rules --project ${projectId}`
      : 'firebase deploy --only firestore:rules';
      
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Security rules deployed successfully');
  } catch (error) {
    console.error('❌ Failed to deploy rules:', error.message);
    process.exit(1);
  }
}

function showIndexSummary() {
  console.log('\n📊 Index Summary:');
  console.log('==================');
  
  const indexesContent = fs.readFileSync(INDEXES_FILE, 'utf8');
  const indexes = JSON.parse(indexesContent);
  
  // Group indexes by collection
  const collections = {};
  
  indexes.indexes.forEach(index => {
    const collection = index.collectionGroup;
    if (!collections[collection]) {
      collections[collection] = [];
    }
    collections[collection].push(index);
  });
  
  Object.keys(collections).forEach(collection => {
    console.log(`\n${collection}:`);
    collections[collection].forEach((index, i) => {
      const fields = index.fields.map(f => `${f.fieldPath} (${f.order})`).join(', ');
      console.log(`  ${i + 1}. ${fields}`);
    });
  });
  
  if (indexes.fieldOverrides) {
    console.log('\nField Overrides:');
    indexes.fieldOverrides.forEach(override => {
      console.log(`  ${override.collectionGroup}.${override.fieldPath}`);
    });
  }
}

function main() {
  const projectId = process.argv[2];
  
  console.log('🔥 Firebase Firestore Index Deployment');
  console.log('=====================================\n');
  
  if (projectId) {
    console.log(`📋 Target project: ${projectId}`);
  } else {
    console.log('📋 Using default Firebase project');
  }
  
  // Pre-deployment checks
  checkFirebaseCLI();
  checkFiles();
  validateIndexesFile();
  
  // Show what will be deployed
  showIndexSummary();
  
  console.log('\n⚠️  This will deploy indexes and rules to your Firebase project.');
  console.log('   Make sure you have the correct project selected.');
  
  // Deploy
  deployIndexes(projectId);
  deployRules(projectId);
  
  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Indexes may take a few minutes to build');
  console.log('   2. Check Firebase Console for index build status');
  console.log('   3. Test your queries to ensure they work correctly');
}

if (require.main === module) {
  main();
}
