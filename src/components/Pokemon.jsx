import React, {useState} from "react";
import Stats from "./Stats.jsx";

const IMG_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';

const TYPE_IMG_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/';
const TYPE_IDS = {
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

const TYPE_BG = {
    normal:   `radial-gradient(circle at center, rgba(243, 244, 246, 0.25), rgba(209, 213, 219, 0.25))`,
    fighting: `radial-gradient(circle at center, rgba(254, 242, 242, 0.25), rgba(252, 165, 165, 0.25))`,
    flying:   `radial-gradient(circle at center, rgba(248, 250, 252, 0.25), rgba(203, 213, 225, 0.25))`,
    poison:   `radial-gradient(circle at center, rgba(250, 245, 255, 0.25), rgba(216, 180, 254, 0.25))`,
    ground:   `radial-gradient(circle at center, rgba(254, 252, 232, 0.25), rgba(234, 179, 8, 0.25))`,
    rock:     `radial-gradient(circle at center, rgba(250, 250, 249, 0.25), rgba(214, 211, 209, 0.25))`,
    bug:      `radial-gradient(circle at center, rgba(247, 254, 231, 0.25), rgba(163, 230, 53, 0.25))`,
    ghost:    `radial-gradient(circle at center, rgba(245, 243, 255, 0.25), rgba(196, 181, 253, 0.25))`,
    steel:    `radial-gradient(circle at center, rgba(243, 244, 246, 0.25), rgba(203, 213, 225, 0.25))`,
    fire:     `radial-gradient(circle at center, rgba(255, 247, 237, 0.25), rgba(253, 186, 116, 0.25))`,
    water:    `radial-gradient(circle at center, rgba(239, 246, 255, 0.25), rgba(147, 197, 253, 0.25))`,
    grass:    `radial-gradient(circle at center, rgba(240, 253, 244, 0.25), rgba(134, 239, 172, 0.25))`,
    electric: `radial-gradient(circle at center, rgba(254, 252, 232, 0.25), rgba(253, 224, 71, 0.25))`,
    psychic:  `radial-gradient(circle at center, rgba(253, 244, 255, 0.25), rgba(232, 121, 249, 0.25))`,
    ice:      `radial-gradient(circle at center, rgba(240, 249, 255, 0.25), rgba(186, 230, 253, 0.25))`,
    dragon:   `radial-gradient(circle at center, rgba(240, 249, 255, 0.25), rgba(125, 211, 252, 0.25))`,
    dark:     `radial-gradient(circle at center, rgba(243, 244, 246, 0.25), rgba(156, 163, 175, 0.25))`,
    fairy:    `radial-gradient(circle at center, rgba(255, 240, 246, 0.25), rgba(249, 168, 212, 0.25))`,
};


function Pokemon({ pokemon, setShowEvolutionChain }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div className={`flex flex-col gap-7 perspective-distant`}>
            <div
                className={`
                    w-84 h-84
                    relative transform-3d cursor-pointer
                    ${flipped && 'rotate-y-180'} transition-transform duration-150 ease-linear
                `}
                onClick={() => setFlipped(!flipped)}
            >
                <div
                    className={`
                        w-full h-full bg-[#f8f8f1] border-6 border-[#fce278] p-3 rounded-2xl shadow-md
                        flex flex-col items-center justify-between
                        absolute inset-0 backface-hidden
                    `}
                >
                    <div className={`w-full flex justify-between items-start`}>
                        <div className={`flex flex-col leading-0 font-semibold`}>
                            <span className={`text-sm text-gray-400`}>{(pokemon.id).toString().padStart(4, "0")}</span>
                            <span className={`text-xl`}>{(pokemon.name[0]).toUpperCase() + pokemon.name.substring(1)}</span>
                        </div>

                        <div className={`flex flex-col gap-1`}>
                            { pokemon.types.map((type) => (
                                <img
                                    key={pokemon.name + type}
                                    className={`h-5`}
                                    src={TYPE_IMG_URL + TYPE_IDS[type] + '.png'}
                                    alt={type} />
                            ))
                            }
                        </div>
                    </div>

                    <div style={{background: TYPE_BG[pokemon.types[0]]}} className={`h-48 w-full flex justify-center items-center bg-[#f8fafc] border-2 border-neutral-300 rounded-lg mt-1.5 mb-2`}>
                        <img className={'w-48 saturate-150 drop-shadow-lg drop-shadow-white'} src={IMG_URL + pokemon.id + '.png'} alt={pokemon.name} />
                    </div>

                    <div className={`text-sm w-full flex justify-center items-center gap-1`}>
                        <div className={`flex-grow text-center`}>
                            Height <br />
                            <span className={`text-base ont-semibold`}>{pokemon.height}</span>
                        </div>

                        <div className={`h-11 w-px bg-gray-700 border-1`}></div>

                        <div className={`flex-grow text-center`}>
                            Weight <br />
                            <span className={`text-base ont-semibold`}>{pokemon.weight}</span>
                        </div>
                    </div>
                </div>

                <div
                    className={`
                        w-full h-full bg-[#f8f8f1] border-6 border-[#fce278] p-3 rounded-2xl shadow-md
                        flex flex-col items-center justify-between
                        absolute inset-0 backface-hidden rotate-y-180
                    `}
                >
                    <div className={`w-full flex justify-between items-start`}>
                        <div className={`flex flex-col leading-0 font-semibold`}>
                            <span className={`text-sm text-gray-400`}>{(pokemon.id).toString().padStart(4, "0")}</span>
                            <span className={`text-xl`}>{(pokemon.name[0]).toUpperCase() + pokemon.name.substring(1)}</span>
                        </div>

                        <div className={`flex flex-col gap-1`}>
                            { pokemon.types.map((type) => (
                                <img
                                    key={pokemon.name + type}
                                    className={`h-5`}
                                    src={TYPE_IMG_URL + TYPE_IDS[type] + '.png'}
                                    alt={type} />
                            ))
                            }
                        </div>
                    </div>

                    <div className={`flex items-center text-sm grow mt-2 mb-2 border-2 border-l-0 border-r-0 italic`}>{pokemon.flavorText}</div>

                    <Stats stats={pokemon.stats} setFlipped={setFlipped} />
                </div>
            </div>

            <button
                className={`
                    flex justify-center items-center rounded-md text-white py-2 px-8 bg-[#E63946]/80 text-lg font-semibold text-upp shadow-sm
                `}
                onClick={ () => setShowEvolutionChain(pokemon.evolutionChain)}
            >Evolution Chain</button>
        </div>
    )
}

export default Pokemon;