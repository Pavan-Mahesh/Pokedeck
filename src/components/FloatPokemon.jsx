import React, {useState} from "react";

import Types from "./Types.jsx";
import Stats from "./Stats.jsx";
import Load from "./Load.jsx";

const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon/";
const SPECIE_URL = "https://pokeapi.co/api/v2/pokemon-species/";

function FloatPokemon(props) {
    const [pokemonInfo, setPokemonInfo] = useState({});
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);

        async function fetchPokemonData() {
            try {
                const [pokemonRes, speciesRes] = await Promise.all([
                    fetch(`${POKEMON_URL}${props.selected.id}`),
                    fetch(`${SPECIE_URL}${props.selected.id}`),
                ])

                const [pokemonData, speciesData] = await Promise.all([
                    pokemonRes.json(),
                    speciesRes.json(),
                ])

                // setting pokemon data
                const totalInches = pokemonData.height * 10 / 2.54;
                let inches = Math.round(totalInches % 12);
                let feet = Math.floor(totalInches / 12);

                if(inches === 12) {
                    feet++;
                    inches = 0;
                }

                // setting species data
                let flavorText = "";
                for (let curr_flavor_text of speciesData.flavor_text_entries) {
                    if(curr_flavor_text.language.name === "en") {
                        if(flavorText.length === 0 || flavorText.length > curr_flavor_text.flavor_text.length) {
                            flavorText = curr_flavor_text.flavor_text;
                        }

                        if(flavorText.length <= 120) {
                            break;
                        }
                    }
                }

                setPokemonInfo({
                    // from pokemon fetch
                    weight: pokemonData.weight / 10,
                    height: {
                        feet: feet,
                        inches: inches.toString().padStart(2, '0'),
                    },
                    types: [...pokemonData.types],
                    stats: [...pokemonData.stats],

                    // from species fetch
                    flavorText: flavorText.replaceAll("\u000c", " "),
                    evolvesFrom: speciesData.evolves_from_species?.name,
                    evolutionChain: speciesData.evolution_chain.url,
                })
            } catch (err) {
                console.error("Error fetching pokemon data. Error:", err);
            }

        }

        fetchPokemonData().then(() => {
            setTimeout(() => {
                setIsLoading(false);
            }, 300)
        });
    }, [props.selected.id]);

    return (
        <div className={`w-full h-full flex items-center justify-center top-0 left-0 fixed`}>
            {
                isLoading
                    ? <Load sideText={true} />
                    : <div
                        className={`    
                            w-80 aspect-[5/7]
                            rounded-xl bg-white shadow-2xl 
                            flex flex-col items-center
                            border-8 border-yellow-300 p-2
                            ${props.animateBack ? 'animate-leave' : 'animate-enter'}
                        `}
                        onAnimationEnd={() => {
                            if (props.animateBack) {
                                props.setSelected(null);
                                props.setAnimateBack(false);
                            }
                        }}
                    >
                            <div className="flex items-end gap-1.5 text-nowrap font-semibold text-xl mb-auto">
                                <div className={'text-base text-gray-500'}>#{props.selected.id.toString().padStart(4, "0")}</div>
                                <div>{props.selected.name.toUpperCase()}</div>
                            </div>

                            <div className={'w-full aspect-video flex justify-evenly items-center'}>
                                <img
                                    className={'w-40 aspect-square saturate-150 drop-shadow-xl'}
                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${props.selected.id}.png`}
                                    alt=""
                                />

                                <div className={'h-full flex flex-col justify-center items-start'}>
                                    { pokemonInfo.evolvesFrom &&
                                        <div className={`text-xs`}>
                                            Evolves from <br/> <span className={'italic font-semibold'}>{pokemonInfo.evolvesFrom.toUpperCase()}</span>
                                        </div>
                                    }
                                    <div className={'text-base leading-5 mt-2 mb-3'}>
                                        <div>Weight: {pokemonInfo.weight} kg</div>
                                        <div>Height: {pokemonInfo.height.feet + `' ` + pokemonInfo.height.inches + `"`}</div>
                                    </div>
                                    <Types types={pokemonInfo.types}/>
                                </div>
                            </div>

                        <div className={`w-full text-base underline underline-offset-2 leading-tight px-0.5 line-clamp-3`} title={pokemonInfo.flavorText}>{pokemonInfo.flavorText}</div>

                        <div className={'mt-auto'}>
                            <Stats stats={pokemonInfo.stats}/>
                        </div>
                    </div>
            }

            <div
                className={`
                    absolute -z-1 w-full h-full bg-gray-950 opacity-50
                    ${props.animateBack ? 'animate-fade-out' : 'animate-fade-in'}
                `}
                onClick={() => {
                    props.setAnimateBack(true);
                    setIsLoading(false);
                }}
            ></div>
        </div>
    )
}

export default FloatPokemon;