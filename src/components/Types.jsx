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

const imgURL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/"
// const imgURL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/brilliant-diamond-and-shining-pearl/"
// const imgURL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/"

function Types(props) {
    return(
        <div className={`flex flex-col items-center gap-1 mr-1`}>
            {props.types.map((typeItem) => {
                const typeID = typeIDs[typeItem.type.name];
                const typeName = typeItem.type.name.charAt(0).toUpperCase() + typeItem.type.name.slice(1);

                return (
                    <img
                        key={typeName}
                        className={`w-24 text-center `}
                        src={`${imgURL}${typeID}.png`}
                        alt={typeName}
                    />
                )
            })}
        </div>
    )
}

export default Types;