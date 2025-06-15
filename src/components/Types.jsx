const typeIDs = {
    normal: 1,
    fighting: 2,
    flying: 3,
    poison: 4,
    ground: 5,
    rock: 6,
    bug: 7,
    ghost: 8,
    steel: 9,
    fire: 10,
    water: 11,
    grass: 12,
    electric: 13,
    psychic: 14,
    ice: 15,
    dragon: 16,
    dark: 17,
    fairy: 18,
}

function Types(props) {
    return(
        <div className={`flex items-center gap-3`}>
            {props.types.map((typeItem) => {
                const typeID = typeIDs[typeItem.type.name];
                const typeName = typeItem.type.name.charAt(0).toUpperCase() + typeItem.type.name.slice(1);

                return (
                    <img
                        key={typeName}
                        className={`w-[100px] h-[22px] text-center rounded`}
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/${typeID}.png`}
                        alt={typeName}
                    />
                )
            })}
        </div>
    )
}

export default Types;