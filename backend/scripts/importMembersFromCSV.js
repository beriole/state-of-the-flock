// backend/scripts/importMembersFromCSV.js
const fs = require('fs');
const path = require('path');
const { sequelize, User, Area, Region, Member } = require('../models');

/**
 * Import members from a CSV file
 * 
 * Usage: node scripts/importMembersFromCSV.js <csv_file_path> <leader_email_or_id>
 * 
 * Example: node scripts/importMembersFromCSV.js ./members.csv calvin.rev@njangui.org
 */

async function importMembers() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node scripts/importMembersFromCSV.js <csv_file_path> <leader_email_or_id>');
    console.error('');
    console.error('Arguments:');
    console.error('  csv_file_path   - Path to the CSV file');
    console.error('  leader_email    - Email or ID of the Bacenta Leader');
    process.exit(1);
  }

  const csvFilePath = args[0];
  const leaderInput = args[1];

  // Check if file exists
  if (!fs.existsSync(csvFilePath)) {
    console.error(`Error: File not found: ${csvFilePath}`);
    process.exit(1);
  }

  try {
    console.log('📊 Starting member import...');
    console.log(`📁 File: ${csvFilePath}`);
    console.log(`👤 Leader: ${leaderInput}`);
    console.log('');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find leader by email or ID
    let leader = await User.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { email: leaderInput },
          { id: leaderInput }
        ]
      }
    });
    
    if (!leader) {
      // Try searching by name
      leader = await User.findOne({
        where: {
          [sequelize.Sequelize.Op.or]: [
            { first_name: { [sequelize.Sequelize.Op.like]: `%${leaderInput}%` } },
            { last_name: { [sequelize.Sequelize.Op.like]: `%${leaderInput}%` } }
          ]
        }
      });
    }

    if (!leader) {
      console.error(`Error: Leader not found: ${leaderInput}`);
      process.exit(1);
    }
    
    const leaderId = leader.id;
    console.log(`✅ Leader found: ${leader.first_name} ${leader.last_name} (ID: ${leaderId})`);

    // Determine area_id
    let finalAreaId = leader.area_id;
    if (!finalAreaId) {
      console.error(`Error: Leader does not have an area assigned.`);
      process.exit(1);
    }

    // Verify area exists
    const area = await Area.findByPk(finalAreaId);
    if (!area) {
      console.error(`Error: Area not found with ID: ${finalAreaId}`);
      process.exit(1);
    }
    console.log(`✅ Area: ${area.name} (ID: ${finalAreaId})`);
    console.log('');

    // Read CSV file
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      console.error('Error: No data found in CSV file');
      process.exit(1);
    }

    // Parse header
    const header = lines[0].split('\t').map(h => h.trim().toLowerCase().replace(/[\s_]/g, ''));
    console.log(`📋 CSV Headers: ${header.join(', ')}`);
    console.log(`📋 Found ${lines.length - 1} data rows`);
    console.log('');

    // Process and import members
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split('\t').map(v => v.trim());
      
      // Create row object from header and values
      const row = {};
      header.forEach((key, index) => {
        row[key] = values[index] || '';
      });

      // Extract member data
      const firstName = row.firstname || row.first_name || row.firstname || '';
      const lastName = row.lastname || row.last_name || row.lastname || '';
      const phonePrimary = row.phone || row.phoneprimary || row.phone_primary || row.tel || '';
      let gender = (row.gender || row.sexe || '').toString().toUpperCase();
      const state = row.state || row.status || 'Sheep';

      // Normalize gender
      if (gender === 'MASCULIN' || gender === 'MALE' || gender === 'H' || gender === 'M') gender = 'M';
      if (gender === 'FEMININ' || gender === 'FEMALE' || gender === 'F') gender = 'F';
      if (gender !== 'M' && gender !== 'F') gender = 'M'; // Default to M since all are marked as "Homme"

      // Validate required fields
      if (!firstName || !lastName) {
        errorCount++;
        const errorMsg = `Row ${i + 1}: Missing first_name or last_name`;
        errors.push(errorMsg);
        console.warn(`⚠️ ${errorMsg}`);
        continue;
      }

      try {
        await Member.create({
          first_name: firstName,
          last_name: lastName,
          phone_primary: phonePrimary || null,
          phone_secondary: null,
          gender: gender,
          is_registered: false,
          state: state,
          area_id: finalAreaId,
          leader_id: leaderId,
          profession: null,
          notes: null,
          is_active: true
        });
        successCount++;
        console.log(`✅ Added: ${firstName} ${lastName} (${state})`);
      } catch (err) {
        errorCount++;
        const errorMsg = `Row ${i + 1}: ${err.message}`;
        errors.push(errorMsg);
        console.warn(`❌ ${errorMsg}`);
      }
    }

    console.log('');
    console.log('========== IMPORT SUMMARY ==========');
    console.log(`✅ Successfully imported: ${successCount} members`);
    console.log(`❌ Errors: ${errorCount} rows`);
    console.log('=====================================');

    if (errors.length > 0) {
      console.log('');
      console.log('Error details:');
      errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
    }

    await sequelize.close();
    console.log('✅ Database connection closed');
    
    process.exit(errorCount > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importMembers();
