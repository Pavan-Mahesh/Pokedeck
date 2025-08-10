import React from "react"

import Load from "./Load.jsx";
import Pokemon from "./Pokemon.jsx";
import closeX from "../assets/close-x.svg"

const POKEDEX_URL = 'https://pokeapi.co/api/v2/pokedex/1';

const LIMIT = 12;
const START = 0;

function PokemonGrid () {
    const [pokemonList, setPokemonList] = React.useState([]);
    const [pokemonInfo, setPokemonInfo] = React.useState({});
    const [count, setCount] = React.useState(START);
    const [isLoading, setIsLoading] = React.useState(false);

    const [showEvolutionChain, setShowEvolutionChain] = React.useState([]);
    const [isClosing, setIsClosing] = React.useState(false);

    const evolutionList = React.useRef({});

    React.useEffect(() => {
        if (globalThis.__POKEMON_LIST_LOADED__ === "done") return;

        globalThis.__POKEMON_LIST_LOADED__ = "in-progress";
        const controller = new AbortController();

        const fetchPokemonList = async () => {
            try {
                setIsLoading(true);

                const res = await fetch(POKEDEX_URL, { signal: controller.signal });
                if (!res.ok) throw new Error("Failed to fetch pokemon list.");

                const data = await res.json();
                const list = data.pokemon_entries.map((entry) => ({
                    name: entry.pokemon_species.name,
                    url: entry.pokemon_species.url,
                }));

                setPokemonList(list);

                await loadMorePokemon({ sourceList: list, count: 0 });

                globalThis.__POKEMON_LIST_LOADED__ = "done";
            } catch (err) {
                if (err.name !== "AbortError")
                    console.log(err.name + ": " + err.message)

                if (globalThis.__POKEMON_LIST_LOADED__)
                    delete globalThis.__POKEMON_LIST_LOADED__;
            } finally {
                setIsLoading(false);
            }
        }

        fetchPokemonList();

        return (() => {
            controller.abort();
        })
    }, []);

    async function loadMorePokemon({ sourceList = pokemonList, start = count }) {
        setIsLoading(true)

        try {
            const slice = sourceList.slice(start, start + LIMIT).filter(p =>  !pokemonInfo[p.name]);
            const newInfo = await getInfo(slice, sourceList);

            let updatedList = {...pokemonInfo, ...newInfo};

            const wantedList = new Set();
            for (let pokemon of Object.values(newInfo)) {
                pokemon.evolutionChain.forEach(path => (
                    path.forEach(stage => {
                        if (!updatedList[stage.name])
                            wantedList.add(stage)
                    })
                ))
            }

            const wantedInfo = await getInfo([...wantedList]);

            updatedList = {...updatedList, ...wantedInfo};

            await delay()

            setPokemonInfo(updatedList);
            setCount((prev) => prev + LIMIT);
        } catch (err) {
            console.log(err.name + ": " + err.message);
        } finally {
            setIsLoading(false);
        }

        async function getInfo(list) {
            const info = await Promise.all(
                list.map((pokemon) => {
                    return getPokemonInfo(pokemon.name)
                        .then(data => data)
                        .catch((err) => {
                            console.log(err.name + ": " + err.message)
                            return null;
                        })
                })
            );

            return info
                .filter(Boolean)
                .reduce((obj1, obj2) => ({...obj1, ...obj2 }), {});
        }
    }

    async function getPokemonInfo(speciesIdOrName) {
        const url = "https://pokeapi.co/api/v2/pokemon-species/" + speciesIdOrName;

        const speciesRes = await fetch(url);

        if(!speciesRes.ok) {
            throw new Error("Failed to fetch pokemon info.");
        }
        const speciesData = await speciesRes.json();

        const pokemonInfo = {}
        pokemonInfo.id = speciesData.id;
        pokemonInfo.name = speciesData.name;
        pokemonInfo.flavorText = speciesData.flavor_text_entries.find((entry) => {
            return entry.flavor_text.length <= 200 && entry.language.name === "en"
        }).flavor_text.replaceAll("\f", "-");
        pokemonInfo.evolutionChainURL = speciesData.evolution_chain.url;
        pokemonInfo.pokemonURL = speciesData.varieties.find((variety) => {
            return variety.is_default
        }).pokemon.url;

        const [pokemonRes, evolutionChainRes] = await Promise.all([
            fetch(pokemonInfo.pokemonURL),
            fetch(pokemonInfo.evolutionChainURL)
        ])

        if(!pokemonRes.ok ||  !evolutionChainRes.ok) {
            throw new Error("Failed to fetch pokemon info.");
        }
        const [pokemonData, evolutionChainData] = await Promise.all([
            pokemonRes.json(),
            evolutionChainRes.json()
        ])

        // converting height form decimeter to meters and inches
        const totalInches = pokemonData.height * 10 / 2.54;
        let feet = Math.floor(totalInches / 12);
        let inches = Math.round(totalInches % 12);
        if (inches === 12) {
            inches = 0;
            feet++;
        }

        // converting weight from hectograms to kg and pounds
        const lbs = (pokemonData.weight * 0.22046).toFixed(1);

        pokemonInfo.height = `${pokemonData.height / 10} m (${feet}'${inches.toString().padStart(2, "0")}")`;
        pokemonInfo.weight = `${pokemonData.weight / 10} kgs (${lbs} lbs)`;
        pokemonInfo.types = pokemonData.types.map((slot) => {
            return slot.type.name;
        })
        pokemonInfo.stats = pokemonData.stats.map((statItem) => {
            return {
                name: statItem.stat.name.split("-").map((word) => {
                    if (word === "hp") return "HP"
                    if (word === "special") return "Spl."
                    return word.charAt(0).toUpperCase() + word.slice(1);
                }).join(" "),
                base_stat: statItem.base_stat,
            }
        })

        // getting evolution data
        const evolutionChainId = pokemonInfo.evolutionChainURL.match(/\/evolution-chain\/(\d+)\//)[1];

        if(!evolutionList.current[evolutionChainId])
            evolutionList.current[evolutionChainId] = getEvolutions(evolutionChainData.chain);

        pokemonInfo.evolutionChain = evolutionList.current[evolutionChainId];

        return {[pokemonInfo.name] : pokemonInfo};

        // Recursive DFS to collect all possible evolution chains as arrays of IDs
        function getEvolutions(chain) {
            const results = [];
            traverse(chain, []);
            return results;

            function traverse(node, path) {
                // Add current Pokémon to the chain
                const newPath = [...path, {
                    name: node.species.name,
                    id: getIdFromUrl(node.species.url),
                }];

                // If no further evolutions, this is a completed path
                if(node.evolves_to.length === 0) {
                    results.push(newPath);
                } else {
                    // Continue recursion through each branch
                    node.evolves_to.map((evo) => traverse(evo, newPath))
                }
            }

            function getIdFromUrl(url) {
                const matchId = url.match(/\/pokemon-species\/(\d+)\//)
                // matchId => ["/pokemon-species/1/", "1"]
                return parseInt(matchId[1], 10);
            }
        }

    }

    function delay() {
        return new Promise(resolve => setTimeout(resolve, 600));
    }

    return (
        <div className="
             w-full h-full px-6 py-10 grid grid-cols-[repeat(auto-fit,21rem)] justify-center gap-x-10 gap-y-14 overflow-y-scroll
        ">
            {
                pokemonList.slice(START, count).map(pokemon => {
                    const pokemonData = pokemonInfo[pokemon?.name];
                    return (
                        <div key={pokemonData.name} className={`flex flex-col gap-6`}>
                            <Pokemon pokemon={pokemonData} setShowEvolutionChain={setShowEvolutionChain} />

                            <button
                                className={`
                                    flex justify-center items-center rounded-md text-white py-2 px-8 bg-[#E63946]/80 text-lg font-semibold shadow-sm cursor-pointer
                                `}
                                onClick={ () => setShowEvolutionChain(pokemonData.evolutionChain)}
                            >Evolution Chain</button>
                        </div>
                    )
                })
            }

            {
                isLoading && [...Array(LIMIT)].map((_, idx) =>
                    <div key={idx} className={`flex flex-col gap-6`}>
                        <div className={`w-[21rem] aspect-square bg-slate-300 rounded-2xl shadow-md animate-pulse`}></div>

                        <div className={`w-[21rem] h-[2.75rem] bg-slate-300 rounded-md animate-pulse shadow-md`}></div>
                    </div>
                )
            }

            <div className={`w-full col-start-1 -col-end-1`}>
                {
                    count < 1025
                        ?   <button
                                className={`
                                    m-auto w-64 h-14 flex justify-center items-center rounded-md bg-[#f49545] text-white text-xl font-semibold ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
                                `}
                                disabled={isLoading}
                                onClick={loadMorePokemon}
                            >{isLoading ? <Load sideText={true} /> : 'Load more Pokemon'}</button>
                        :   <h1 className={`text-center text-2xl font-bold font-cursive`}>You have reached the end of the deck...</h1>
                }
            </div>

            {
                (showEvolutionChain.length > 0 || isClosing) &&
                <div
                    className={`w-full h-full flex justify-center pt-8 p-4 overflow-y-auto overflow-x-hidden absolute inset-0 bg-black/80
                    ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
                    onAnimationEnd={() => {
                        if (isClosing) {
                            setIsClosing(false);
                            setShowEvolutionChain([]);
                        }
                    }}
                >
                    <div className={`my-auto flex flex-wrap justify-center gap-x-8 gap-y-14`}> {
                        showEvolutionChain.map((path, idx) => {
                            return (
                                <div className={`h-max shrink-0 flex flex-col xl:flex-row justify-center gap-6 bg-slate-300/60 py-8 px-6 rounded-xl overflow-y-visible`} key={idx}>{
                                    path.map((stage) => {
                                        const pokemonData = pokemonInfo[stage.name];
                                        return <Pokemon key={pokemonData.name} pokemon={pokemonData} />
                                    })
                                }</div>
                            )
                        })
                    } </div>
                   <button
                       className={`w-12 h-12 rounded-full fixed right-6 top-6 bg-black/60 p-2 cursor-pointer`}
                       onClick={() => {
                           setIsClosing(true);
                       }}
                   >
                       <img src={closeX} alt="X" />
                   </button>
                </div>
            }
        </div>
    )
}

export default PokemonGrid;