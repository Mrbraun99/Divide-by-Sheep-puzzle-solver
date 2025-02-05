class LaserWall {
    static process(entities) {
        entities = Array.from(entities, Number);
        entities[EntityType.SHEEP_HALF] = min(9, entities[EntityType.SHEEP_HALF] + 2 * entities[EntityType.SHEEP]);
        entities[EntityType.SHEEP] = 0;
        return entities.join("");
    }
}