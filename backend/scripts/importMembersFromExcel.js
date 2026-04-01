// backend/scripts/importMembersFromExcel.js
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { sequelize, User, Area, Region, Member } = require('../models');

/**
 * Import members from an Excel file
 * 
 * Expected Excel columns:
 * - first_name (required)
 * - last_name (required)
 * - phone_primary (optional)
 * - phone_secondary (optional)
 * - gender (optional): M, F, or empty
 * - state (optional): Sheep, Goat, Deer
 * - profession (optional)
 * - notes (optional)
 * 
 * Usage: node scripts/importMembersFromExcel.js <excel_file_path> <leader_id> [area_id]
 * 
 * Example: node scripts/importMembersFromExcel.js ./members.xlsx leader-uuid
 * Example: node scripts/importMembersFromExcel.js ./members.xlsx leader-uuid area-uuid
 */

async function importMembers() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node scripts/importMembersFromExcel.js <excel_file_path> <leader_id> [area_id]');
    console.error('');
    console.error('Arguments:');
    console.error('  excel_file_path  - Path to the Excel file (.xlsx or .xls)');
    console.error('  leader_id       - UUID of the Bacenta Leader who will own these members');
    console.error('  area_id         - (optional) UUID of the Area. If not provided, uses leader\'s area');
    process.exit(1);
  }

  const excelFilePath = args[0];
  const leaderId = args[1];
  const areaId = args[2] || null;

  // Check if file exists
  if (!fs.existsSync(excelFilePath)) {
    console.error(`Error: File not found: ${excelFilePath}`);
    process.exit(1);
  }

  try {
    console.log('📊 Starting member import...');
    console.log(`📁 File: ${excelFilePath}`);
    console.log(`👤 Leader ID: ${leaderId}`);
    console.log(`📍 Area ID: ${areaId || '(will be determined from leader)'}`);
    console.log('');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get leader info
    const leader = await User.findByPk(leaderId);
    if (!leader) {
      console.error(`Error: Leader not found with ID: ${leaderId}`);
      process.exit(1);
    }
    console.log(`✅ Leader found: ${leader.first_name} ${leader.last_name}`);

    // Determine area_id
    let finalAreaId = areaId;
    if (!finalAreaId) {
      if (!leader.area_id) {
        console.error(`Error: Leader does not have an area assigned. Please provide area_id.`);
        process.exit(1);
      }
      finalAreaId = leader.area_id;
      console.log(`✅ Using leader's area: ${finalAreaId}`);
    }

    // Verify area exists
    const area = await Area.findByPk(finalAreaId);
    if (!area) {
      console.error(`Error: Area not found with ID: ${finalAreaId}`);
      process.exit(1);
    }
    console.log(`✅ Area: ${area.name}`);

    // Read Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    if (!rawData || rawData.length === 0) {
      console.error('Error: No data found in Excel file');
      process.exit(1);
    }

    console.log(`📋 Found ${rawData.length} rows in Excel file`);
    console.log('');

    // Process and import members
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Normalize column names (handle different cases and spaces)
    const normalizeColumnName = (col) => {
      return col.toLowerCase().replace(/[\s_]/g, '');
    };

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      
      // Normalize row keys
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = normalizeColumnName(key);
        normalizedRow[normalizedKey] = row[key];
      });

      // Extract member data
      const firstName = normalizedRow.firstname || normalizedRow.first_name || normalizedRow.prénom || normalizedRow.prenom || null;
      const lastName = normalizedRow.lastname || normalizedRow.last_name || normalizedRow.nom || null;
      const phonePrimary = normalizedRow.phoneprimary || normalizedRow.phone_primary || normalizedRow.phone || normalizedRow.téléphone || normalizedRow.tel || '';
      const phoneSecondary = normalizedRow.phonesecondary || normalizedRow.phone_secondary || normalizedRow.phone2 || '';
      let gender = (normalizedRow.gender || normalizedRow.sexe || normalizedRow.genre || '').toString().toUpperCase();
      if (gender === 'MASCULIN' || gender === 'MALE' || gender === 'H') gender = 'M';
      if (gender === 'FEMININ' || gender === 'FEMALE' || gender === 'F') gender = 'F';
      if (gender !== 'M' && gender !== 'F') gender = 'Unknown';
      
      const state = normalizedRow.state || normalizedRow.status || 'Sheep';
      const profession = normalizedRow.profession || normalizedRow.job || '';
      const notes = normalizedRow.notes || normalizedRow.remarks || '';

      // Validate required fields
      if (!firstName || !lastName) {
        errorCount++;
        const errorMsg = `Row ${i + 2}: Missing first_name or last_name`;
        errors.push(errorMsg);
        console.warn(`⚠️ ${errorMsg}`);
        continue;
      }

      try {
        await Member.create({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_primary: phonePrimary ? phonePrimary.toString().trim() : null,
          phone_secondary: phoneSecondary ? phoneSecondary.toString().trim() : null,
          gender: gender,
          is_registered: false,
          state: state,
          area_id: finalAreaId,
          leader_id: leaderId,
          profession: profession || null,
          notes: notes || null,
          is_active: true
        });
        successCount++;
        console.log(`✅ Added: ${firstName} ${lastName}`);
      } catch (err) {
        errorCount++;
        const errorMsg = `Row ${i + 2}: ${err.message}`;
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
      errors.forEach(err => console.log(`  - ${err}`));
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
