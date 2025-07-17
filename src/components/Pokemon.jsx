import React from "react";
import Stats from "./Stats.jsx";

const IMG_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';

const TYPE_IMG_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/';
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

function Pokemon({ pokemon }) {
    return (
        <div
            className={`
                w-84 aspect-[9/16] bg-white border-6 border-[#fde173] p-4 rounded-xl shadow-md 
                flex flex-col items-center justify-between
                font-ranchers overflow-y-hidden
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
                            src={TYPE_IMG_URL + typeIDs[type] + '.png'}
                            alt={type} />
                    ))
                    }
                </div>
            </div>

            <div className={`h-48 w-full flex justify-center items-center border rounded-md mt-1.5 mb-1`}>
                <img className={'w-48 saturate-150 drop-shadow-lg'} src={IMG_URL + pokemon.id + '.png'} alt={pokemon.name} />
            </div>

            <div className={`text-sm w-full flex justify-center items-center gap-1 mt-1`}>
                <div className={`flex-grow text-center`}>
                    Height <br />
                    <span className={`font-semibold`}>{pokemon.height}</span>
                </div>

                <div className={`h-8 w-px bg-gray-700 border-0`}></div>

                <div className={`flex-grow text-center`}>
                    Weight <br />
                    <span className={`font-semibold`}>{pokemon.weight}</span>
                </div>
            </div>

            <div className={`flex items-center text-sm grow mt-2 mb-2 border border-l-0 border-r-0 italic`}>{pokemon.flavorText}</div>

            <Stats stats={pokemon.stats} />

            {/*<div>{pokemon.evolutionChain.map((path, idx) => {*/}
            {/*    return (*/}
            {/*        <div className={'flex'} key={pokemon.name + idx}>{*/}
            {/*            path.map((stage) => {*/}
            {/*                return <img key={pokemon.name + stage.name} className={'w-16'} src={IMG_URL + stage.id + '.png'} alt={stage.name} />*/}
            {/*            })*/}
            {/*        }</div>*/}
            {/*    )*/}
            {/*})}</div>*/}
        </div>
    )
}

export default Pokemon;