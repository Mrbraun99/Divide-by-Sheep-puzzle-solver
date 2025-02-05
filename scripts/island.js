class Island {
    constructor(pos, data) {
        this.pos = pos;
        this.type = data.type;
        this.block_count = [IslandType.DELIVERY_ISLAND, IslandType.BOUNCE_BLOCK_ISLAND].includes(data.type) ? 9 : data.block_count;
        this.has_border = [IslandType.DELIVERY_ISLAND, IslandType.BOUNCE_BLOCK_ISLAND].includes(data.type) ? false : data.has_border;
        this.has_portal = [IslandType.DELIVERY_ISLAND, IslandType.BOUNCE_BLOCK_ISLAND].includes(data.type) ? false : data.has_portal;;
        this.walls = data.walls;
        this.arrows = (this.type == IslandType.BOUNCE_BLOCK_ISLAND) ? data.arrows : [];
    }

    static leave(entities) {
        entities = Array.from(entities, Number);

        if (entities[EntityType.PIG] > 0) {
            const leave = [0, 0, 0, 0, 0, 0];

            leave[EntityType.PIG] = entities[EntityType.PIG];
            entities[EntityType.PIG] = 0;

            return { "leave": leave.join(""), "remaining": entities.join("") };
        }

        if (entities[EntityType.SHEEP] > 0 || entities[EntityType.SHEEP_HALF] > 0) {
            const leave = [0, 0, 0, 0, 0, 0];

            leave[EntityType.SHEEP] = entities[EntityType.SHEEP];
            leave[EntityType.SHEEP_HALF] = entities[EntityType.SHEEP_HALF];
            entities[EntityType.SHEEP] = 0;
            entities[EntityType.SHEEP_HALF] = 0;

            return { "leave": leave.join(""), "remaining": entities.join("") };
        }

        if (entities[EntityType.WOLF_HUNGRY] > 0) {
            const leave = [0, 0, 0, 0, 0, 0];

            leave[EntityType.WOLF_HUNGRY] = entities[EntityType.WOLF_HUNGRY];
            entities[EntityType.WOLF_HUNGRY] = 0;

            return { "leave": leave.join(""), "remaining": entities.join("") };
        }

        if (entities[EntityType.FIRE_STATUE] > 0) {
            return { "leave": "00000" + entities[EntityType.FIRE_STATUE], "remaining": "000000" };
        }
    }

    static arrive(entities, entities_on_island, island) {
        let death_count = 0;

        entities = Array.from(entities, Number);
        entities_on_island = Array.from(entities_on_island, Number);

        if (entities_on_island[EntityType.FIRE_STATUE] > 0) {
            death_count += entities[EntityType.SHEEP] + entities[EntityType.WOLF_HUNGRY] + entities[EntityType.WOLF_FULL] + entities[EntityType.PIG];
            return { "death_count": death_count, "no_space": "000000", "remaining": "00000" + entities_on_island[EntityType.FIRE_STATUE] };
        }

        if (entities[EntityType.FIRE_STATUE] > 0) {
            death_count += entities_on_island[EntityType.SHEEP] + entities_on_island[EntityType.WOLF_HUNGRY] + entities_on_island[EntityType.WOLF_FULL] + entities_on_island[EntityType.PIG];
            return { "death_count": death_count, "no_space": "000000", "remaining": "00000" + entities[EntityType.FIRE_STATUE] };
        }

        const original_entities = {};
        original_entities[EntityType.SHEEP_HALF] = entities_on_island[EntityType.SHEEP_HALF];
        original_entities[EntityType.SHEEP] = entities_on_island[EntityType.SHEEP];
        original_entities[EntityType.WOLF_HUNGRY] = entities_on_island[EntityType.WOLF_HUNGRY];
        original_entities[EntityType.PIG] = entities_on_island[EntityType.PIG];

        if (entities[EntityType.SHEEP_HALF] > 0) {
            const emptyblock_count = island.block_count - entities_on_island.reduce((acc, a) => { return acc + a; }, 0);

            let amount = min(entities[EntityType.SHEEP_HALF], entities_on_island[EntityType.WOLF_HUNGRY]);
            entities_on_island[EntityType.WOLF_HUNGRY] -= amount;
            entities_on_island[EntityType.WOLF_FULL] += amount;
            entities[EntityType.SHEEP_HALF] -= amount;

            amount = min(entities[EntityType.SHEEP_HALF], emptyblock_count);
            entities_on_island[EntityType.SHEEP_HALF] += amount;
            entities[EntityType.SHEEP_HALF] -= amount;

            amount = min(entities[EntityType.SHEEP_HALF], entities_on_island[EntityType.SHEEP]);
            entities_on_island[EntityType.SHEEP] -= amount;
            entities_on_island[EntityType.SHEEP_HALF] += amount;
            entities[EntityType.SHEEP_HALF] -= amount;
            death_count += amount;

            amount = min(entities[EntityType.SHEEP_HALF], original_entities[EntityType.SHEEP_HALF]);
            entities[EntityType.SHEEP_HALF] -= amount;

            amount = min(entities[EntityType.SHEEP_HALF], entities_on_island[EntityType.PIG]);
            entities_on_island[EntityType.PIG] -= amount;
            entities_on_island[EntityType.SHEEP_HALF] += amount;
            entities[EntityType.SHEEP_HALF] -= amount;
            death_count += amount;
        }

        if (entities[EntityType.SHEEP] > 0) {
            const emptyblock_count = island.block_count - entities_on_island.reduce((acc, a) => { return acc + a; }, 0);

            let amount = min(entities[EntityType.SHEEP], entities_on_island[EntityType.WOLF_HUNGRY]);
            entities_on_island[EntityType.WOLF_HUNGRY] -= amount;
            entities_on_island[EntityType.WOLF_FULL] += amount;
            entities[EntityType.SHEEP] -= amount;
            death_count += amount;

            amount = min(entities[EntityType.SHEEP], emptyblock_count);
            entities_on_island[EntityType.SHEEP] += amount;
            entities[EntityType.SHEEP] -= amount;

            amount = min(entities[EntityType.SHEEP], entities_on_island[EntityType.SHEEP_HALF]);
            entities_on_island[EntityType.SHEEP_HALF] -= amount;
            entities_on_island[EntityType.SHEEP] += amount;
            entities[EntityType.SHEEP] -= amount;

            amount = min(entities[EntityType.SHEEP], original_entities[EntityType.SHEEP]);
            entities[EntityType.SHEEP] -= amount;
            death_count += amount;

            amount = min(entities[EntityType.SHEEP], entities_on_island[EntityType.PIG]);
            entities_on_island[EntityType.PIG] -= amount;
            entities_on_island[EntityType.SHEEP] += amount;
            entities[EntityType.SHEEP] -= amount;
            death_count += amount;
        }

        if (entities[EntityType.WOLF_HUNGRY] > 0) {
            const emptyblock_count = island.block_count - entities_on_island.reduce((acc, a) => { return acc + a; }, 0);

            let amount = min(entities[EntityType.WOLF_HUNGRY], entities_on_island[EntityType.SHEEP_HALF]);
            entities_on_island[EntityType.SHEEP_HALF] -= amount;
            entities_on_island[EntityType.WOLF_FULL] += amount;
            entities[EntityType.WOLF_HUNGRY] -= amount;

            amount = min(entities[EntityType.WOLF_HUNGRY], entities_on_island[EntityType.SHEEP]);
            entities_on_island[EntityType.SHEEP] -= amount;
            entities_on_island[EntityType.WOLF_FULL] += amount;
            entities[EntityType.WOLF_HUNGRY] -= amount;
            death_count += amount;

            amount = min(entities[EntityType.WOLF_HUNGRY], entities_on_island[EntityType.PIG]);
            entities_on_island[EntityType.PIG] -= amount;
            entities_on_island[EntityType.WOLF_FULL] += amount;
            entities[EntityType.WOLF_HUNGRY] -= amount;
            death_count += amount;

            amount = min(entities[EntityType.WOLF_HUNGRY], emptyblock_count);
            entities_on_island[EntityType.WOLF_HUNGRY] += amount;
            entities[EntityType.WOLF_HUNGRY] -= amount;

            amount = min(entities[EntityType.WOLF_HUNGRY], original_entities[EntityType.WOLF_HUNGRY]);
            entities[EntityType.WOLF_HUNGRY] -= amount;
            death_count += amount;
        }

        if (entities[EntityType.PIG] > 0) {
            const emptyblock_count = island.block_count - entities_on_island.reduce((acc, a) => { return acc + a; }, 0);

            let amount = min(entities[EntityType.PIG], entities_on_island[EntityType.WOLF_HUNGRY]);
            entities_on_island[EntityType.WOLF_HUNGRY] -= amount;
            entities_on_island[EntityType.WOLF_FULL] += amount;
            entities[EntityType.PIG] -= amount;
            death_count += amount;

            amount = min(entities[EntityType.PIG], entities_on_island[EntityType.SHEEP]);
            entities_on_island[EntityType.SHEEP] -= amount;
            entities_on_island[EntityType.PIG] += amount;
            entities[EntityType.PIG] -= amount;
            death_count += amount;

            amount = min(entities[EntityType.PIG], emptyblock_count);
            entities_on_island[EntityType.PIG] += amount;
            entities[EntityType.PIG] -= amount;

            amount = min(entities[EntityType.PIG], original_entities[EntityType.PIG]);
            entities[EntityType.PIG] -= amount;
            death_count += amount;
        }

        return { "death_count": death_count, "no_space": entities.join(""), "remaining": entities_on_island.join("") };
    }
}