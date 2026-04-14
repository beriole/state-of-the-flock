const { Oversee, Region, Area, User } = require('../models');

exports.createOversee = async (req, res) => {
    try {
        const { name, region_id, overseer_id, areas } = req.body;
        
        const oversee = await Oversee.create({
            name,
            region_id,
            overseer_id
        });

        if (areas && areas.length > 0) {
            await Area.update(
                { oversee_id: oversee.id },
                { where: { id: areas } }
            );
        }

        res.status(201).json(oversee);
    } catch (error) {
        console.error('Error creating oversee:', error);
        res.status(500).json({ error: 'Server error creating oversee' });
    }
};

exports.getAllOversees = async (req, res) => {
    try {
        const oversees = await Oversee.findAll({
            include: [
                { model: Region, as: 'region', attributes: ['id', 'name'] },
                { model: User, as: 'overseer', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: Area, as: 'areas', attributes: ['id', 'name', 'number'] }
            ]
        });
        res.status(200).json(oversees);
    } catch (error) {
        console.error('Error fetching oversees:', error);
        res.status(500).json({ error: 'Server error fetching oversees' });
    }
};

exports.updateOversee = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, region_id, overseer_id, areas } = req.body;

        const oversee = await Oversee.findByPk(id);
        if (!oversee) {
            return res.status(404).json({ error: 'Oversee not found' });
        }

        await oversee.update({ name, region_id, overseer_id });

        // Update areas if provided
        if (areas) {
            // First detach all old areas
            await Area.update({ oversee_id: null }, { where: { oversee_id: id } });
            // Then attach new areas
            if (areas.length > 0) {
                await Area.update({ oversee_id: id }, { where: { id: areas } });
            }
        }

        res.status(200).json(oversee);
    } catch (error) {
        console.error('Error updating oversee:', error);
        res.status(500).json({ error: 'Server error updating oversee' });
    }
};

exports.deleteOversee = async (req, res) => {
    try {
        const { id } = req.params;
        const oversee = await Oversee.findByPk(id);
        if (!oversee) {
            return res.status(404).json({ error: 'Oversee not found' });
        }
        
        // Detach areas
        await Area.update({ oversee_id: null }, { where: { oversee_id: id } });
        
        await oversee.destroy();
        res.status(200).json({ message: 'Oversee deleted successfully' });
    } catch (error) {
        console.error('Error deleting oversee:', error);
        res.status(500).json({ error: 'Server error deleting oversee' });
    }
};
