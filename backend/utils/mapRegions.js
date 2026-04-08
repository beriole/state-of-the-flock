const data = [
  { firstName: 'Marcel', lastName: 'Ps', email: 'marcel.ps@njangui.org', phone: '677001122', region: 'Area 1', zone: 'Camp Sonel', pass: 'Marcel@123' },
  { firstName: 'Yvette', lastName: 'Lp', email: 'yvette.lp@njangui.org', phone: '677112233', region: 'Area 1', zone: 'Afanayo', pass: 'Yvette@123' },
  { firstName: 'Akongnwi', lastName: 'Leader', email: 'akongnwi@njangui.org', phone: '677223344', region: 'Area 1', zone: 'Cimencam', pass: 'Akongnwi@123' },
  { firstName: 'Vera', lastName: 'Overseer', email: 'vera@njangui.org', phone: '677334455', region: 'Area 2', zone: 'Mendong', pass: 'Vera@123' },
  { firstName: 'Clovis', lastName: 'Ps', email: 'clovis.ps@njangui.org', phone: '677445566', region: 'Area 2', zone: 'Simbock / Eloumdem', pass: 'Clovis@123' },
  { firstName: 'Daline', lastName: 'Leader', email: 'daline@njangui.org', phone: '677556677', region: 'Area 2', zone: 'Mbalgon', pass: 'Daline@123' },
  { firstName: 'Noella', lastName: 'Leader', email: 'noella@njangui.org', phone: '677667788', region: 'Area 2', zone: 'Damas', pass: 'Noella@123' },
  { firstName: 'Rayon', lastName: 'Leader', email: 'rayon@njangui.org', phone: '677778899', region: 'Area 2', zone: 'Efoulan', pass: 'Rayon@123' },
  { firstName: 'Marco', lastName: 'Leader', email: 'marco@njangui.org', phone: '678001122', region: 'Area 2', zone: 'Bandoumou', pass: 'Marco@123' },
  { firstName: 'Aimé', lastName: 'Ps', email: 'aime.ps@njangui.org', phone: '678112233', region: 'Area 2', zone: 'Nkonfulu', pass: 'Aime@123' },
  { firstName: 'Emmanuel', lastName: 'Glory', email: 'emmanuel.glory@njangui.org', phone: '678223344', region: 'Area 2', zone: 'Soa 1', pass: 'Emmanuel@123' },
  { firstName: 'Calvin', lastName: 'Rev', email: 'calvin.rev@njangui.org', phone: '678334455', region: 'Area 2', zone: 'IAI', pass: 'Calvin@123' },
  { firstName: 'Esther', lastName: 'Leader', email: 'esther@njangui.org', phone: '678445566', region: 'Area 2', zone: 'ODZA', pass: 'Esther@123' },
  { firstName: 'Annie', lastName: 'Grace', email: 'annie.grace@njangui.org', phone: '678556677', region: 'Area 2', zone: 'Ekounou', pass: 'Annie@123' },
  { firstName: 'Reward', lastName: 'Leader', email: 'reward@njangui.org', phone: '678667788', region: 'Area 2', zone: 'Nsam', pass: 'Reward@123' },
  { firstName: 'Mercedes', lastName: 'Ps', email: 'mercedes.ps@njangui.org', phone: '678778899', region: 'Area 2', zone: 'Siantou / Coron', pass: 'Mercedes@123' },
  { firstName: 'Sandrine', lastName: 'Lp', email: 'sandrine.lp@njangui.org', phone: '679001122', region: 'Area 2', zone: 'Ecole de Poste', pass: 'Sandrine@123' },
  { firstName: 'Mukete', lastName: 'Leader', email: 'mukete@njangui.org', phone: '679112233', region: 'Area 2', zone: 'Etoug-Ebe', pass: 'Mukete@123' },
  { firstName: 'Cynthia', lastName: 'Lp', email: 'cynthia.lp@njangui.org', phone: '679223344', region: 'Area 2', zone: 'Nkolbison', pass: 'Cynthia@123' },
  { firstName: 'Priscilla', lastName: 'Lp', email: 'priscilla.lp@njangui.org', phone: '679334455', region: 'Area 2', zone: 'Obili', pass: 'Priscilla@123' },
  { firstName: 'Bongeh', lastName: 'Leader', email: 'bongeh@njangui.org', phone: '679445566', region: 'Area 2', zone: 'Mvog-Betsi', pass: 'Bongeh@123' },
  { firstName: 'Tracey', lastName: 'Rev', email: 'tracey.rev@njangui.org', phone: '679556677', region: 'Area 2', zone: 'Bonas', pass: 'Tracey@123' },
  { firstName: 'Clifford', lastName: 'Leader', email: 'clifford@njangui.org', phone: '679667788', region: 'Area 2', zone: 'Mimboman 2', pass: 'Clifford@123' },
  { firstName: 'Samuel', lastName: 'Ps', email: 'samuel.ps@njangui.org', phone: '679778899', region: 'Area 2', zone: 'Eloumdem / Damas / Simbock', pass: 'Samuel@123' },
  { firstName: 'Lydia', lastName: 'Lp', email: 'lydia.lp@njangui.org', phone: '680001122', region: 'Area 2', zone: 'Tropicana', pass: 'Lydia@123' },
  { firstName: 'Dexter', lastName: 'Ps', email: 'dexter.ps@njangui.org', phone: '680112233', region: 'Area 2', zone: 'FLES', pass: 'Dexter@123' },
  { firstName: 'Akime', lastName: 'Rev', email: 'akime.rev@njangui.org', phone: '680223344', region: 'Area 2', zone: 'General', pass: 'Akime@123' },
  { firstName: 'Rosa', lastName: 'Joy', email: 'rosa.joy@njangui.org', phone: '680334455', region: 'Area 2', zone: 'General', pass: 'Rosa@123' },
  { firstName: 'Ricardo', lastName: 'Leader', email: 'ricardo@njangui.org', phone: '680445566', region: 'Area 2', zone: 'General', pass: 'Ricardo@123' },
  { firstName: 'Stella', lastName: 'Lp', email: 'stella.lp@njangui.org', phone: '681001122', region: 'Area 3', zone: 'Choir', pass: 'Stella@123' },
  { firstName: 'Nora', lastName: 'Lp', email: 'nora.lp@njangui.org', phone: '681112233', region: 'Area 3', zone: 'Choir', pass: 'Nora@123' },
  { firstName: 'Maxi', lastName: 'Leader', email: 'maxi@njangui.org', phone: '681223344', region: 'Area 3', zone: 'FES Choir', pass: 'Maxi@123' },
  { firstName: 'Shalom', lastName: 'Leader', email: 'shalom@njangui.org', phone: '681334455', region: 'Area 3', zone: 'GES Choir', pass: 'Shalom@123' },
  { firstName: 'Jacobson', lastName: 'Leader', email: 'jacobson@njangui.org', phone: '681445566', region: 'Area 3', zone: 'Doves', pass: 'Jacobson@123' },
  { firstName: 'Rawlings', lastName: 'Leader', email: 'rawlings@njangui.org', phone: '681556677', region: 'Area 3', zone: 'Spiders', pass: 'Rawlings@123' },
  { firstName: 'Cimon', lastName: 'Leader', email: 'cimon@njangui.org', phone: '681667788', region: 'Area 3', zone: 'Unicorn', pass: 'Cimon@123' },
  { firstName: 'Ricardo', lastName: 'Leader', email: 'ricardo.ds@njangui.org', phone: '681778899', region: 'Area 3', zone: 'FES DS', pass: 'Ricardo@123' },
  { firstName: 'Kevine', lastName: 'Leader', email: 'kevine@njangui.org', phone: '682001122', region: 'Area 3', zone: 'Film Stars', pass: 'Kevine@123' },
  { firstName: 'Karl', lastName: 'Leader', email: 'karl@njangui.org', phone: '682112233', region: 'Area 4', zone: 'Ushers', pass: 'Karl@123' },
  { firstName: 'Smith', lastName: 'Leader', email: 'smith@njangui.org', phone: '682223344', region: 'Area 4', zone: 'Ushers', pass: 'Smith@123' },
  { firstName: 'Chris', lastName: 'Leader', email: 'chris@njangui.org', phone: '682334455', region: 'Area 4', zone: 'Ushers', pass: 'Chris@123' },
  { firstName: 'Claris', lastName: 'Leader', email: 'claris@njangui.org', phone: '682445566', region: 'Area 4', zone: 'Airport Stars', pass: 'Claris@123' },
  { firstName: 'GES', lastName: 'Leader', email: 'ges.airport@njangui.org', phone: '682556677', region: 'Area 4', zone: 'Airport GES', pass: 'Ges@123' },
  { firstName: 'FES', lastName: 'Leader', email: 'fes.airport@njangui.org', phone: '682667788', region: 'Area 4', zone: 'Airport FES', pass: 'Fes@123' },
  { firstName: 'Elysee', lastName: 'Dr', email: 'elysee.dr@njangui.org', phone: '682778899', region: 'Area 4', zone: 'Projection', pass: 'Elysee@123' },
  { firstName: 'Rudolph', lastName: 'Leader', email: 'rudolph@njangui.org', phone: '683001122', region: 'Area 4', zone: 'Perfect Sound', pass: 'Rudolph@123' },
  { firstName: 'Cathy', lastName: 'Leader', email: 'cathy@njangui.org', phone: '683112233', region: 'Area 4', zone: 'Photography', pass: 'Cathy@123' },
  { firstName: 'Leena', lastName: 'Leader', email: 'leena@njangui.org', phone: '683223344', region: 'Area 4', zone: 'Communion Stars', pass: 'Leena@123' },
  { firstName: 'Mike', lastName: 'Ps', email: 'mike.ps@njangui.org', phone: '683334455', region: 'Area 4', zone: 'Instrumentalist', pass: 'Mike@123' }
];

async function mapAllRegions() {
  const { User, Region, Area, sequelize } = require('../models');
  const { Op } = require('sequelize');
  const bcrypt = require('bcrypt');

  let logs = [];

  try {
    // 1. Bulk fetch existing data
    const existingRegions = await Region.findAll();
    const regionByName = new Map(existingRegions.map(r => [r.name, r]));

    const existingAreas = await Area.findAll();
    // Use composite key "RegionID|AreaName" to handle duplicates across regions
    const areaMap = new Map(existingAreas.map(a => [`${a.region_id}|${a.name}`, a]));

    const existingUsers = await User.findAll({ attributes: ['id', 'email', 'area_id'] });
    const userMap = new Map(existingUsers.map(u => [u.email.toLowerCase(), u]));

    // 2. Ensure Area 1-4 Regions exist
    for (let i = 1; i <= 4; i++) {
        const name = `Area ${i}`;
        if (!regionByName.has(name)) {
            const r = await Region.create({ name });
            regionByName.set(name, r);
            logs.push(`Region CREATED: ${name}`);
        } else {
            logs.push(`Region OK: ${name}`);
        }
    }

    // 3. Process each Governor
    for (const gov of data) {
      const email = gov.email.toLowerCase();
      const targetRegion = regionByName.get(gov.region);
      
      if (!targetRegion) {
        logs.push(`ERROR: Target Region ${gov.region} not in DB for ${email}`);
        continue;
      }

      // Look for Zone within PRECISE Region
      const areaKey = `${targetRegion.id}|${gov.zone}`;
      let area = areaMap.get(areaKey);

      if (!area) {
        // Search globally to see if it exists but in wrong region
        const globalArea = existingAreas.find(a => a.name === gov.zone && a.region_id !== targetRegion.id);
        if (globalArea) {
            logs.push(`Zone MOVED: ${gov.zone} from Region ${globalArea.region_id} to ${targetRegion.id}`);
            await globalArea.update({ region_id: targetRegion.id });
            area = globalArea;
        } else {
            // Create fresh area
            let number = 1 + areaMap.size;
            area = await Area.create({ name: gov.zone, region_id: targetRegion.id, number });
            logs.push(`Zone CREATED: ${gov.zone} in ${gov.region}`);
        }
        areaMap.set(areaKey, area);
      } else {
        logs.push(`Zone OK: ${gov.zone} in ${gov.region}`);
      }

      // Process User
      let user = userMap.get(email);
      if (!user) {
        const password_hash = await bcrypt.hash(gov.pass, 10);
        user = await User.create({
          email: gov.email,
          password_hash,
          role: 'Governor',
          church_role: 'Governor',
          permissions: ['READ_ALL', 'WRITE_OWN', 'DELETE_OWN'],
          first_name: gov.firstName,
          last_name: gov.lastName,
          phone_primary: gov.phone,
          account_status: 'Active',
          area_id: area.id
        });
        userMap.set(email, user);
        logs.push(`User CREATED: ${gov.firstName} ${gov.lastName} (${email}) linked to ${gov.zone}`);
      } else {
        // Force update area_id if wrong
        if (user.area_id !== area.id) {
            await user.update({ area_id: area.id });
            logs.push(`User RE-MAPPED: ${email} moved to zone ${gov.zone}`);
        } else {
            logs.push(`User OK: ${email} already in ${gov.zone}`);
        }
      }
    }

    // --- PHASE 2: CLEANUP REDUNDANT DATA ---
    // 4. Align Member Area IDs with Leader Area IDs
    // We update via Sequelize to safely move any members from an old redundant zone to the new official zone of their leader.
    for (const gov of data) {
      const email = gov.email.toLowerCase();
      let user = userMap.get(email);
      if (user && user.area_id) {
         await sequelize.models.Member.update(
           { area_id: user.area_id }, 
           { where: { leader_id: user.id } }
         );
      }
    }
    logs.push("Cleanup: Aligned ALL Member Area IDs with their Governors' Areas.");

    // 5. Delete redundant Areas (Zones) that are NOT part of the official 51 areas mapping.
    const officialAreaIds = Array.from(areaMap.values()).map(a => a.id);
    const deletedAreas = await Area.destroy({
      where: {
        id: { [Op.notIn]: officialAreaIds }
      }
    });
    logs.push(`Cleanup: Deleted ${deletedAreas} old redundant Area(s).`);

    // 6. Delete old redundant Regions (anything not Area 1, 2, 3, or 4)
    const officialRegionIds = Array.from(regionByName.values())
        .filter(r => ['Area 1', 'Area 2', 'Area 3', 'Area 4'].includes(r.name))
        .map(r => r.id);

    const deletedRegions = await Region.destroy({
      where: {
        id: { [Op.notIn]: officialRegionIds }
      }
    });
    logs.push(`Cleanup: Deleted ${deletedRegions} old redundant Region(s).`);


    return { 
        success: true, 
        processed: data.length, 
        summary: {
            created: logs.filter(l => l.includes('CREATED')).length,
            moved: logs.filter(l => l.includes('MOVED') || l.includes('RE-MAPPED')).length,
            deletedAreas,
            deletedRegions,
            ok: logs.filter(l => l.includes('OK')).length,
            errors: logs.filter(l => l.includes('ERROR')).length
        },
        logs 
    };

  } catch (err) {
    console.error('Mapping error:', err);
    return { success: false, error: err.message };
  }
}

module.exports = { mapAllRegions };
